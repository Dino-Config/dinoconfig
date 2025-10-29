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
    const features = this.subscriptionService.getFeaturesMap(subscription.tier, subscription.status);

    return {
      tier: subscription.tier,
      status: subscription.status,
      limits: {
        maxBrands: limits.maxBrands,
        maxConfigsPerBrand: limits.maxConfigsPerBrand
      },
      features,
      currentPeriodEnd: subscription.currentPeriodEnd,
      isActive: subscription.status === 'active' || subscription.status === 'trialing'
    };
  }

  @Post('checkout-session')
  async createCheckoutSession(@Req() req, @Body() body: any) {
    const { auth0Id } = req.user;
    const user = await this.usersService.findByAuth0Id(auth0Id);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!body || !body.priceId) {
      console.error('Missing price ID. Body:', JSON.stringify(body, null, 2));
      throw new Error('Price ID is required in request body');
    }

    const session = await this.stripeService.createCheckoutSession(
      user,
      body.priceId
    );

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

    const stripeSubscription = await this.stripeService.getSubscription(subscription.stripeSubscriptionId);
    const tier = this.stripeService.getTierFromPriceId(stripeSubscription.items.data[0].price.id);
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

    const subscription = await this.subscriptionService.findByUserId(user.id);
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      return { message: 'No Stripe subscription found for user' };
    }

    const stripeSubscription = await this.stripeService.getSubscription(subscription.stripeSubscriptionId);
    const tier = this.stripeService.getTierFromPriceId(stripeSubscription.items.data[0].price.id);
    
    const status = this.stripeService.mapStripeStatus(stripeSubscription.status);
    
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

    const subscription = await this.subscriptionService.findByUserId(user.id);
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    try {
      // Cancel the subscription in Stripe
      await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);

      // Cancel any existing FREE subscriptions for this customer
      if (subscription.stripeCustomerId) {
        await this.stripeService.cancelAllFreeSubscriptions(subscription.stripeCustomerId);
      }

      // Update local subscription to free tier (this will clear Stripe fields)
      const updatedLocalSubscription = await this.subscriptionService.cancelSubscription(user.id);

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

  @Post('cleanup-free-subscriptions')
  async cleanupFreeSubscriptions(@Req() req) {
    const { auth0Id } = req.user;
    const user = await this.usersService.findByAuth0Id(auth0Id);
    
    if (!user) {
      throw new Error('User not found');
    }

    const subscription = await this.subscriptionService.findByUserId(user.id);
    
    if (!subscription || !subscription.stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }

    try {
      await this.stripeService.cancelAllFreeSubscriptions(subscription.stripeCustomerId);
      return {
        message: 'FREE subscriptions cleaned up successfully'
      };
    } catch (error) {
      console.error('Failed to cleanup FREE subscriptions:', error);
      throw new Error('Failed to cleanup FREE subscriptions. Please try again.');
    }
  }

  @Get('limit-violations')
  async checkLimitViolations(@Req() req) {
    const { auth0Id } = req.user;
    const user = await this.usersService.findByAuth0Id(auth0Id);
    
    if (!user) {
      throw new Error('User not found');
    }

    const violations = await this.subscriptionService.checkLimitViolations(user.id);
    
    return {
      hasViolations: violations.hasViolations,
      violations: violations.violations,
      currentTier: violations.currentTier,
      limits: violations.limits
    };
  }

}

