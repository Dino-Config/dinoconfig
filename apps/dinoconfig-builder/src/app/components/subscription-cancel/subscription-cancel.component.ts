import { Component, signal, inject, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionStatus } from '../../models/subscription.models';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'dc-subscription-cancel',
  standalone: true,
  imports: [
    MatButtonModule
],
  templateUrl: './subscription-cancel.component.html',
  styleUrl: './subscription-cancel.component.scss'
})
export class SubscriptionCancelComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private subscriptionService = inject(SubscriptionService);

  subscription = signal<SubscriptionStatus | null>(null);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadSubscription();
  }

  loadSubscription(): void {
    this.loading.set(true);
    this.subscriptionService.getSubscriptionWithViolations().pipe(
      catchError(() => of(null))
    ).subscribe(data => {
      if (data) {
        this.subscription.set({
          tier: data.tier,
          status: data.status,
          limits: data.limits,
          features: data.features,
          currentPeriodEnd: data.currentPeriodEnd,
          isActive: data.isActive
        });
      }
      this.loading.set(false);
    });
  }

  getCurrentTierName(): string {
    if (!this.subscription()) return 'Free';
    return this.subscriptionService.getTierDisplayName(this.subscription()!.tier);
  }

  getCurrentTierDescription(): string {
    if (!this.subscription()) return '1 brand, 1 config per brand';
    const tier = this.subscription()!.tier;
    switch (tier) {
      case 'free':
        return '1 brand, 1 config per brand';
      case 'starter':
        return '5 brands, 3 configs per brand';
      case 'pro':
        return '20 brands, 20 configs per brand';
      case 'custom':
        return 'Unlimited brands and configs';
      default:
        return '';
    }
  }

  goToSubscription(): void {
    this.router.navigate(['/subscription']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  contactSupport(): void {
    window.open('mailto:support@dinoconfig.com?subject=Checkout%20Issue', '_blank');
  }
}

