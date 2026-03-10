import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionService } from '../subscriptions/subscription.service';
import { StripeService } from '../subscriptions/stripe.service';

/**
 * Encapsulates eligibility checks for account operations (e.g. closure).
 * Uses Stripe to detect unpaid invoices before allowing account close.
 */
@Injectable()
export class AccountEligibilityService {
  private readonly logger = new Logger(AccountEligibilityService.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * Returns true if the user has unpaid invoices (block account closure).
   * Checks Stripe for open or uncollectible invoices on the user's customer.
   */
  async hasUnpaidInvoices(userId: number): Promise<boolean> {
    const subscription = await this.subscriptionService.findByUserId(userId);
    if (!subscription?.stripeCustomerId) {
      return false;
    }
    const hasUnpaid = await this.stripeService.hasUnpaidInvoices(subscription.stripeCustomerId);
    if (hasUnpaid) {
      this.logger.log({ message: 'User has unpaid invoices', userId, stripeCustomerId: subscription.stripeCustomerId });
    }
    return hasUnpaid;
  }
}
