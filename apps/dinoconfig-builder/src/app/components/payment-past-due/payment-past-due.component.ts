import { Component, signal, inject } from '@angular/core';
import { SubscriptionService } from '../../services/subscription.service';
import { LimitViolationService } from '../../services/limit-violation.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'dc-payment-past-due',
  standalone: true,
  imports: [],
  templateUrl: './payment-past-due.component.html',
  styleUrl: './payment-past-due.component.scss'
})
export class PaymentPastDueComponent {
  private subscriptionService = inject(SubscriptionService);
  private limitViolationService = inject(LimitViolationService);

  loading = signal(false);
  error = signal<string | null>(null);

  retryPayment(): void {
    this.loading.set(true);
    this.error.set(null);
    this.subscriptionService.retryPayment().pipe(
      catchError((err: { error?: { message?: string } }) => {
        this.error.set(err.error?.message || 'Unable to load payment page. Please try again.');
        this.loading.set(false);
        return of(null);
      })
    ).subscribe(data => {
      if (data?.url) {
        window.location.href = data.url;
      }
      this.loading.set(false);
    });
  }

  updatePaymentMethod(): void {
    this.loading.set(true);
    this.error.set(null);
    this.subscriptionService.createPortalSession().pipe(
      catchError((err: { error?: { message?: string } }) => {
        this.error.set(err.error?.message || 'Unable to open billing portal. Please try again.');
        this.loading.set(false);
        return of(null);
      })
    ).subscribe(data => {
      if (data?.url) {
        window.location.href = data.url;
      }
      this.loading.set(false);
    });
  }

  refreshStatus(): void {
    this.error.set(null);
    this.limitViolationService.refreshViolations();
  }
}
