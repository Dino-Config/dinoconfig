import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionStatus } from '../../models/subscription.models';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'dc-subscription-success',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    SpinnerComponent
  ],
  templateUrl: './subscription-success.component.html',
  styleUrl: './subscription-success.component.scss'
})
export class SubscriptionSuccessComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private subscriptionService = inject(SubscriptionService);

  subscription = signal<SubscriptionStatus | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  localError = signal<string | null>(null);

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParams['session_id'];
    
    if (sessionId) {
      // Wait a moment for webhook to process, then refresh subscription
      setTimeout(() => {
        this.refreshSubscription();
      }, 2000);
    } else {
      this.localError.set('No session ID found');
      this.loading.set(false);
    }
  }

  refreshSubscription(): void {
    this.subscriptionService.refreshSubscriptionStatus().pipe(
      catchError((err: any) => {
        console.error('Failed to refresh subscription status:', err);
        this.error.set(err.error?.message || 'Failed to refresh subscription status');
        return of(null);
      })
    ).subscribe(() => {
      // After refreshing, load the subscription data
      this.loadSubscription();
    });
  }

  loadSubscription(): void {
    this.loading.set(true);
    this.subscriptionService.getSubscriptionWithViolations().pipe(
      catchError((err: any) => {
        this.error.set(err.error?.message || 'Unable to load subscription details');
        this.loading.set(false);
        return of(null);
      })
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

  getTierDisplayName(tier: string): string {
    return this.subscriptionService.getTierDisplayName(tier);
  }

  getTierBenefits(tier: string): string[] {
    switch (tier) {
      case 'starter':
        return [
          'Up to 5 brands',
          'Up to 10 configs per brand',
          'Basic SDK access',
          'Community support',
          '99.9% uptime SLA'
        ];
      case 'pro':
        return [
          'Up to 20 brands',
          'Up to 20 configs per brand',
          'All SDKs & APIs',
          'Advanced targeting',
          'Priority support',
          'Version history',
          'Team collaboration',
          '99.99% uptime SLA'
        ];
      case 'custom':
        return [
          'Unlimited brands & configs',
          'Everything in Pro',
          'SAML SSO',
          'Custom integrations',
          'Dedicated support',
          'On-premise option'
        ];
      default:
        return [
          'Basic features',
          'Community support'
        ];
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  goToSubscription(): void {
    this.router.navigate(['/subscription']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}

