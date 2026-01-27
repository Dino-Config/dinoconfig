import { Component, input, inject } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'dc-subscription-limit-warning',
  standalone: true,
  imports: [],
  templateUrl: './subscription-limit-warning.component.html',
  styleUrl: './subscription-limit-warning.component.scss'
})
export class SubscriptionLimitWarningComponent {
  private router = inject(Router);

  message = input.required<string>();
  currentTier = input.required<string>();

  handleUpgrade(): void {
    this.router.navigate(['/subscription']);
  }
}

