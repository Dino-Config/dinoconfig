import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SubscriptionService } from '../../services/subscription.service';
import { LimitViolationService } from '../../services/limit-violation.service';
import { SubscriptionStatus } from '../../models/subscription.models';
import { environment } from '../../../environments/environment';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { catchError, of } from 'rxjs';

interface Plan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  tier: 'free' | 'starter' | 'pro' | 'custom';
  priceId: string;
  isFeatured?: boolean;
  badge?: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
  isVisible: boolean;
}

@Component({
  selector: 'dc-subscription',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SpinnerComponent
  ],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent implements OnInit {
  private router = inject(Router);
  private subscriptionService = inject(SubscriptionService);
  private limitViolationService = inject(LimitViolationService);

  subscription = signal<SubscriptionStatus | null>(null);
  loading = signal<boolean>(true);
  processingTier = signal<string | null>(null);
  notification = signal<Notification | null>(null);

  plans: Plan[] = [
    {
      name: 'Starter',
      price: '$9.99',
      period: '/month',
      description: 'Perfect for small projects',
      features: [
        '5 brands',
        '10 configs per brand',
        'Basic SDK',
        'Community support',
        '99.9% uptime SLA'
      ],
      tier: 'starter',
      priceId: environment.stripeStarterPriceId || 'price_starter'
    },
    {
      name: 'Pro',
      price: '$29.99',
      period: '/month',
      description: 'For growing teams',
      features: [
        '20 brands',
        '20 configs per brand',
        'All SDKs & APIs',
        'Priority support',
        'Version history',
        'Team collaboration',
        '99.99% uptime SLA'
      ],
      tier: 'pro',
      priceId: environment.stripeProPriceId || 'price_pro',
      isFeatured: true,
      badge: 'Most Popular'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Unlimited brands & configs',
        'Everything in Pro',
        'Custom integrations',
        'Dedicated support',
        'On-premise option'
      ],
      tier: 'custom',
      priceId: 'contact'
    }
  ];

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

  getTierDisplayName(tier: string): string {
    return this.subscriptionService.getTierDisplayName(tier);
  }

  isCurrentPlan(tier: string): boolean {
    return this.subscription()?.tier === tier;
  }

  getButtonText(plan: Plan): string {
    if (this.isCurrentPlan(plan.tier)) return 'Current Plan';
    if (this.processingTier() === plan.tier) return 'Processing...';
    if (plan.tier === 'custom') return 'Contact Sales';
    const currentTier = this.subscription()?.tier;
    if (!currentTier || currentTier === 'free') return `Upgrade to ${plan.name}`;
    return 'Change Plan';
  }

  getButtonClass(plan: Plan): string {
    if (this.isCurrentPlan(plan.tier)) return 'btn btn--current';
    if (plan.isFeatured) return 'btn btn--primary';
    return 'btn btn--secondary';
  }

  handlePlanAction(plan: Plan): void {
    if (plan.priceId === 'contact') {
      this.handleContactSales();
      return;
    }

    if (this.isCurrentPlan(plan.tier)) {
      return;
    }

    const currentTier = this.subscription()?.tier;
    if (currentTier && currentTier !== 'free' && plan.tier !== currentTier) {
      this.handleChangePlan(plan.priceId, plan.tier);
    } else {
      this.handleUpgrade(plan.priceId, plan.tier);
    }
  }

  handleUpgrade(priceId: string, tier: string): void {
    this.processingTier.set(tier);
    this.subscriptionService.createCheckoutSession(priceId).pipe(
      catchError((err: any) => {
        this.showNotification('error', 'Failed to start checkout. Please try again.');
        this.processingTier.set(null);
        return of(null);
      })
    ).subscribe(data => {
      if (data) {
        window.location.href = data.url;
      }
    });
  }

  handleChangePlan(priceId: string, tierName: string): void {
    this.processingTier.set(tierName);
    this.subscriptionService.changeSubscriptionPlan(priceId).pipe(
      catchError((err: any) => {
        this.showNotification('error', 'Failed to change subscription plan. Please try again.');
        this.processingTier.set(null);
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
        // Refresh the limit violation service to update the left navigation
        this.limitViolationService.refreshViolations();
        this.showNotification('success', `Successfully changed to ${data.newTier} plan!`);
      }
      this.processingTier.set(null);
    });
  }

  handleManageSubscription(): void {
    this.subscriptionService.createPortalSession().pipe(
      catchError((err: any) => {
        this.showNotification('error', 'Customer portal not configured. Please configure it in your Stripe dashboard.');
        return of(null);
      })
    ).subscribe(data => {
      if (data) {
        window.location.href = data.url;
      }
    });
  }

  handleContactSales(): void {
    window.open('mailto:sales@dinoconfig.com?subject=Enterprise%20Plan%20Inquiry', '_blank');
  }

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification.set({ type, message, isVisible: true });
    setTimeout(() => {
      this.notification.set(null);
    }, 5000);
  }

  hideNotification(): void {
    this.notification.set(null);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }
}

