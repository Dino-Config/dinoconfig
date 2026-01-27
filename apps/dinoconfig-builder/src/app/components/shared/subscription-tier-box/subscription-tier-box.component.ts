import { Component, input, inject } from '@angular/core';

import { Router } from '@angular/router';
import { SubscriptionStatus } from '../../../models/subscription.models';
import { SubscriptionService } from '../../../services/subscription.service';

@Component({
  selector: 'dc-subscription-tier-box',
  standalone: true,
  imports: [],
  templateUrl: './subscription-tier-box.component.html',
  styleUrl: './subscription-tier-box.component.scss'
})
export class SubscriptionTierBoxComponent {
  private router = inject(Router);
  private subscriptionService = inject(SubscriptionService);

  subscription = input.required<SubscriptionStatus>();

  getTierDisplayName(tier: string): string {
    return this.subscriptionService.getTierDisplayName(tier);
  }

  navigateToSubscription(): void {
    this.router.navigate(['/subscription']);
  }
}

