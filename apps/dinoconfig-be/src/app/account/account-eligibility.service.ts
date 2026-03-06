import { Injectable } from '@nestjs/common';

/**
 * Encapsulates eligibility checks for account operations (e.g. closure).
 * When Stripe/billing is integrated, add hasUnpaidInvoices implementation here.
 */
@Injectable()
export class AccountEligibilityService {
  /**
   * Returns true if the user has unpaid invoices (block account closure).
   * TODO: integrate with Stripe/billing when ready.
   */
  async hasUnpaidInvoices(_userId: number): Promise<boolean> {
    return false;
  }
}
