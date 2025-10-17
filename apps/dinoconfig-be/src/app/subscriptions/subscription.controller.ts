import { Controller, Get, Post, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../security/guard/jwt.guard';
import { SubscriptionService } from './subscription.service';
import { UsersService } from '../users/user.service';
import { StripeService } from './stripe.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(
    private subscriptionService: SubscriptionService,
    private stripeService: StripeService,
    private usersService: UsersService
  ) {}

  @Get('status')
  async getSubscriptionStatus(@Req() req) {
    const { auth0Id } = req.user;
    const user = await this.usersService.findByAuth0Id(auth0Id);
    
    if (!user) {
      throw new Error('User not found');
    }

    const subscription = await this.subscriptionService.getOrCreateDefaultSubscription(user.id);
    const limits = this.subscriptionService.getTierLimits(subscription.tier);

    console.log(`Status check for user ${user.id}:`);
    console.log(`- Tier: ${subscription.tier}`);
    console.log(`- Status: ${subscription.status}`);
    console.log(`- Stripe Customer ID: ${subscription.stripeCustomerId}`);
    console.log(`- Stripe Subscription ID: ${subscription.stripeSubscriptionId}`);
    console.log(`- Stripe Price ID: ${subscription.stripePriceId}`);

    return {
      tier: subscription.tier,
      status: subscription.status,
      limits: {
        maxBrands: limits.maxBrands,
        maxConfigsPerBrand: limits.maxConfigsPerBrand
      },
      currentPeriodEnd: subscription.currentPeriodEnd,
      isActive: subscription.status === 'active' || subscription.status === 'trialing'
    };
  }

  @Post('checkout-session')
  async createCheckoutSession(@Req() req, @Body() body: any) {
    console.log('=== CHECKOUT SESSION REQUEST ===');
    console.log('Request headers:', req.headers);
    console.log('Request body:', body);
    console.log('Body type:', typeof body);
    console.log('Body keys:', Object.keys(body || {}));
    console.log('Raw body exists:', !!req.body);
    console.log('Raw body:', req.body);
    
    const { auth0Id } = req.user;
    const user = await this.usersService.findByAuth0Id(auth0Id);
    
    if (!user) {
      throw new Error('User not found');
    }

    console.log('Price ID from body:', body?.priceId);

    if (!body || !body.priceId) {
      console.error('Missing price ID. Body:', JSON.stringify(body, null, 2));
      throw new Error('Price ID is required in request body');
    }

    console.log(`Creating checkout session for user ${user.id} with price ID: ${body.priceId}`);

    const session = await this.stripeService.createCheckoutSession(
      user,
      body.priceId
    );

    console.log(`Checkout session created: ${session.id}`);
    console.log('=== END CHECKOUT SESSION REQUEST ===');

    return { sessionId: session.id, url: session.url };
  }

  @Post('portal-session')
  async createPortalSession(@Req() req) {
    const { auth0Id } = req.user;
    const user = await this.usersService.findByAuth0Id(auth0Id);
    
    if (!user) {
      throw new Error('User not found');
    }

    const subscription = await this.subscriptionService.findByUserId(user.id);
    
    if (!subscription || !subscription.stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }

    const session = await this.stripeService.createPortalSession(
      subscription.stripeCustomerId
    );

    return { url: session.url };
  }

  @Post('refresh-status')
  async refreshSubscriptionStatus(@Req() req) {
    const { auth0Id } = req.user;
    const user = await this.usersService.findByAuth0Id(auth0Id);
    
    if (!user) {
      throw new Error('User not found');
    }

    const subscription = await this.subscriptionService.findByUserId(user.id);
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      // Return current subscription status if no Stripe subscription
      const currentSubscription = await this.subscriptionService.getOrCreateDefaultSubscription(user.id);
      const limits = this.subscriptionService.getTierLimits(currentSubscription.tier);

      return {
        tier: currentSubscription.tier,
        status: currentSubscription.status,
        limits: {
          maxBrands: limits.maxBrands,
          maxConfigsPerBrand: limits.maxConfigsPerBrand
        },
        currentPeriodEnd: currentSubscription.currentPeriodEnd,
        isActive: currentSubscription.status === 'active' || currentSubscription.status === 'trialing'
      };
    }

    // Fetch latest subscription from Stripe
    const stripeSubscription = await this.stripeService.getSubscription(subscription.stripeSubscriptionId);
    console.log(`Refresh: Stripe price ID: ${stripeSubscription.items.data[0].price.id}`);
    const tier = this.stripeService.getTierFromPriceId(stripeSubscription.items.data[0].price.id);
    console.log(`Refresh: Mapped tier: ${tier}`);
    const status = this.stripeService.mapStripeStatus(stripeSubscription.status);

    // Update local subscription
    const updatedSubscription = await this.subscriptionService.createOrUpdateSubscription(user.id, {
      tier,
      status,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0].price.id,
    });

    const limits = this.subscriptionService.getTierLimits(updatedSubscription.tier);

    return {
      tier: updatedSubscription.tier,
      status: updatedSubscription.status,
      limits: {
        maxBrands: limits.maxBrands,
        maxConfigsPerBrand: limits.maxConfigsPerBrand
      },
      currentPeriodEnd: updatedSubscription.currentPeriodEnd,
      isActive: updatedSubscription.status === 'active' || updatedSubscription.status === 'trialing'
    };
  }

  @Post('test-webhook')
  async testWebhook(@Req() req) {
    const { auth0Id } = req.user;
    const user = await this.usersService.findByAuth0Id(auth0Id);
    
    if (!user) {
      throw new Error('User not found');
    }

    console.log(`Testing webhook for user ${user.id}`);
    
    // Get the user's subscription
    const subscription = await this.subscriptionService.findByUserId(user.id);
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      return { message: 'No Stripe subscription found for user' };
    }

    console.log(`Found subscription: ${subscription.stripeSubscriptionId}`);
    
    // Manually trigger the subscription update logic
    const stripeSubscription = await this.stripeService.getSubscription(subscription.stripeSubscriptionId);
    console.log(`Retrieved Stripe subscription: ${stripeSubscription.id}`);
    console.log(`Price ID: ${stripeSubscription.items.data[0].price.id}`);
    
    const tier = this.stripeService.getTierFromPriceId(stripeSubscription.items.data[0].price.id);
    console.log(`Mapped tier: ${tier}`);
    
    const status = this.stripeService.mapStripeStatus(stripeSubscription.status);
    
    // Update the subscription
    const updatedSubscription = await this.subscriptionService.createOrUpdateSubscription(user.id, {
      tier,
      status,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0].price.id,
    });

    return {
      message: 'Webhook test completed',
      oldTier: subscription.tier,
      newTier: updatedSubscription.tier,
      stripePriceId: stripeSubscription.items.data[0].price.id
    };
  }

  @Post('change-plan')
  async changeSubscriptionPlan(@Req() req, @Body() body: { priceId: string }) {
    const { auth0Id } = req.user;
    const user = await this.usersService.findByAuth0Id(auth0Id);
    
    if (!user) {
      throw new Error('User not found');
    }

    console.log(`Changing subscription plan for user ${user.id} to price ID: ${body.priceId}`);

    const subscription = await this.subscriptionService.findByUserId(user.id);
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    try {
      // Update the subscription in Stripe
      const updatedSubscription = await this.stripeService.updateSubscription(
        subscription.stripeSubscriptionId,
        body.priceId
      );

      // Update local subscription
      const tier = this.stripeService.getTierFromPriceId(body.priceId);
      const updatedLocalSubscription = await this.subscriptionService.createOrUpdateSubscription(user.id, {
        tier,
        status: 'active' as any,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        stripePriceId: body.priceId,
      });

      console.log(`Subscription plan changed to ${tier} for user ${user.id}`);

      return {
        message: 'Subscription plan changed successfully',
        newTier: tier,
        subscriptionId: subscription.stripeSubscriptionId
      };
    } catch (error) {
      console.error('Failed to change subscription plan:', error);
      throw new Error('Failed to change subscription plan. Please try again.');
    }
  }

  @Post('cancel-subscription')
  async cancelSubscription(@Req() req) {
    const { auth0Id } = req.user;
    const user = await this.usersService.findByAuth0Id(auth0Id);
    
    if (!user) {
      throw new Error('User not found');
    }

    console.log(`Cancelling subscription for user ${user.id}`);

    const subscription = await this.subscriptionService.findByUserId(user.id);
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    try {
      // Cancel the subscription in Stripe
      await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);

      // Update local subscription to free tier
      const updatedLocalSubscription = await this.subscriptionService.createOrUpdateSubscription(user.id, {
        tier: 'free' as any,
        status: 'cancelled' as any,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        stripePriceId: subscription.stripePriceId,
      });

      console.log(`Subscription cancelled and downgraded to free for user ${user.id}`);

      return {
        message: 'Subscription cancelled successfully',
        newTier: 'free',
        subscriptionId: subscription.stripeSubscriptionId
      };
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new Error('Failed to cancel subscription. Please try again.');
    }
  }
}

