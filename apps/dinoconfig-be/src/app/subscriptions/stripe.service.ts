import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SubscriptionService } from './subscription.service';
import { SubscriptionTier, SubscriptionStatus } from './entities/subscription.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    private subscriptionService: SubscriptionService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured');
    }

    this.stripe = new Stripe(stripeSecretKey || 'sk_test_dummy', {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createCheckoutSession(user: User, priceId: string): Promise<Stripe.Checkout.Session> {
    let stripeCustomerId: string | undefined;
    
    const subscription = await this.subscriptionService.findByUserId(user.id);
    if (subscription?.stripeCustomerId) {
      stripeCustomerId = subscription.stripeCustomerId;
    } else {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id.toString(),
          auth0Id: user.auth0Id
        }
      });
      stripeCustomerId = customer.id;
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${this.configService.get('FRONTEND_URL')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/subscription/cancel`,
      metadata: {
        userId: user.id.toString(),
      },
    });

    return session;
  }

  async createPortalSession(customerId: string): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${this.configService.get('FRONTEND_URL')}/settings`,
      });

      return session;
    } catch (error) {
      this.logger.error('Failed to create portal session:', error);
      throw new Error('Customer portal is not configured. Please configure it in your Stripe dashboard at https://dashboard.stripe.com/test/settings/billing/portal');
    }
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw err;
    }

    this.logger.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = parseInt(session.metadata?.userId || '0');
    
    if (!userId) {
      this.logger.error('No userId in checkout session metadata');
      return;
    }

    const subscriptionId = session.subscription as string;
    const stripeSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    
    this.logger.log(`Processing checkout session for user ${userId}`);
    this.logger.log(`Stripe subscription ID: ${subscriptionId}`);
    this.logger.log(`Price ID from Stripe: ${stripeSubscription.items.data[0].price.id}`);
    
    const tier = this.getTierFromPriceId(stripeSubscription.items.data[0].price.id);

    this.logger.log(`Mapped tier: ${tier}`);

    await this.subscriptionService.createOrUpdateSubscription(userId, {
      tier,
      status: SubscriptionStatus.ACTIVE,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: stripeSubscription.items.data[0].price.id,
    });

    this.logger.log(`Subscription created for user ${userId} with tier ${tier}`);
  }

  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await this.subscriptionService.findByStripeSubscriptionId(
      stripeSubscription.id
    );

    if (!subscription) {
      this.logger.error(`Subscription not found for Stripe subscription ${stripeSubscription.id}`);
      return;
    }

    const tier = this.getTierFromPriceId(stripeSubscription.items.data[0].price.id);
    const status = this.mapStripeStatus(stripeSubscription.status);

    await this.subscriptionService.createOrUpdateSubscription(subscription.user.id, {
      tier,
      status,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0].price.id,
    });

    this.logger.log(`Subscription updated for user ${subscription.user.id}`);
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await this.subscriptionService.findByStripeSubscriptionId(
      stripeSubscription.id
    );

    if (!subscription) {
      this.logger.error(`Subscription not found for Stripe subscription ${stripeSubscription.id}`);
      return;
    }

    await this.subscriptionService.cancelSubscription(subscription.user.id);
    this.logger.log(`Subscription cancelled for user ${subscription.user.id}`);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptionField = (invoice as any).subscription;
    const subscriptionId = typeof subscriptionField === 'string' 
      ? subscriptionField 
      : subscriptionField?.id;
    
    if (!subscriptionId) return;

    const subscription = await this.subscriptionService.findByStripeSubscriptionId(
      subscriptionId
    );

    if (!subscription) return;

    await this.subscriptionService.updateStripeSubscription(
      subscription.user.id,
      subscriptionId,
      SubscriptionStatus.ACTIVE,
      new Date(invoice.period_end * 1000)
    );

    this.logger.log(`Invoice payment succeeded for user ${subscription.user.id}`);
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptionField = (invoice as any).subscription;
    const subscriptionId = typeof subscriptionField === 'string' 
      ? subscriptionField 
      : subscriptionField?.id;
    
    if (!subscriptionId) return;

    const subscription = await this.subscriptionService.findByStripeSubscriptionId(
      subscriptionId
    );

    if (!subscription) return;

    await this.subscriptionService.updateStripeSubscription(
      subscription.user.id,
      subscriptionId,
      SubscriptionStatus.PAST_DUE,
      new Date(invoice.period_end * 1000)
    );

    this.logger.log(`Invoice payment failed for user ${subscription.user.id}`);
  }


  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    
    return this.stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations',
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.cancel(subscriptionId);
  }

  public getTierFromPriceId(priceId: string): SubscriptionTier {
    // Map your Stripe price IDs to tiers
    // You'll need to configure these in your environment variables
    const starterPriceId = this.configService.get('STRIPE_STARTER_PRICE_ID');
    const proPriceId = this.configService.get('STRIPE_PRO_PRICE_ID');
    const customPriceId = this.configService.get('STRIPE_CUSTOM_PRICE_ID');

    // Temporary hardcoded fallback until environment variables are configured
    const fallbackStarterPriceId = 'price_1SIxxUH7N4M4kaOnOnYnEIsH';
    const fallbackProPriceId = 'price_1SIxxmH7N4M4kaOn4uafT7ey';

    this.logger.log(`Mapping price ID: ${priceId}`);
    this.logger.log(`Environment starter price ID: ${starterPriceId}`);
    this.logger.log(`Environment pro price ID: ${proPriceId}`);

    // Check environment variables first
    if (priceId === starterPriceId) {
      this.logger.log(`Matched starter tier from environment variable`);
      return SubscriptionTier.STARTER;
    } else if (priceId === proPriceId) {
      this.logger.log(`Matched pro tier from environment variable`);
      return SubscriptionTier.PRO;
    } else if (priceId === customPriceId) {
      this.logger.log(`Matched custom tier from environment variable`);
      return SubscriptionTier.CUSTOM;
    }

    // Fallback to hardcoded values if environment variables are not set
    if (priceId === fallbackStarterPriceId) {
      this.logger.log(`Matched starter tier from fallback`);
      return SubscriptionTier.STARTER;
    } else if (priceId === fallbackProPriceId) {
      this.logger.log(`Matched pro tier from fallback`);
      return SubscriptionTier.PRO;
    }

    this.logger.warn(`No tier match found for price ID: ${priceId}, defaulting to FREE`);
    return SubscriptionTier.FREE;
  }

  public mapStripeStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'canceled':
        return SubscriptionStatus.CANCELLED;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }
}

