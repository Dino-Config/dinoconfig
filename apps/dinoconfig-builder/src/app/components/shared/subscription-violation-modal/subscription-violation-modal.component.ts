import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubscriptionService } from '../../../services/subscription.service';
import { LimitViolationsResult } from '../../../models/subscription.models';

@Component({
  selector: 'dc-subscription-violation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-violation-modal.component.html',
  styleUrl: './subscription-violation-modal.component.scss'
})
export class SubscriptionViolationModalComponent {
  private router = inject(Router);
  private subscriptionService = inject(SubscriptionService);

  violations = input.required<LimitViolationsResult>();

  recommendedPlan = computed(() => {
    const violations = this.violations();
    const maxBrandsNeeded = Math.max(...violations.violations
      .filter(v => v.type === 'brands')
      .map(v => v.current), 1);
    
    const maxConfigsNeeded = Math.max(...violations.violations
      .filter(v => v.type === 'configs')
      .map(v => v.current), 1);

    if (maxBrandsNeeded > 5) {
      return 'pro';
    }
    
    if (maxBrandsNeeded <= 1 && maxConfigsNeeded <= 1) {
      return 'free';
    } else if (maxBrandsNeeded <= 5 && maxConfigsNeeded <= 10) {
      return 'starter';
    } else if (maxBrandsNeeded <= 20 && maxConfigsNeeded <= 20) {
      return 'pro';
    } else {
      return 'custom';
    }
  });

  getTierDisplayName(tier: string): string {
    return this.subscriptionService.getTierDisplayName(tier);
  }

  handleUpgrade(): void {
    this.router.navigate(['/subscription']);
  }
}

