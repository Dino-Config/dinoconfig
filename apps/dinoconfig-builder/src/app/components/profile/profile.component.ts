import { Component, signal, computed, inject, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserStateService } from '../../services/user-state.service';
import { SubscriptionService } from '../../services/subscription.service';
import { User } from '../../models/user.models';
import { SubscriptionStatus } from '../../models/subscription.models';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'dc-profile',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    SpinnerComponent
],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private router = inject(Router);
  private userState = inject(UserStateService);
  private subscriptionService = inject(SubscriptionService);

  user = this.userState.user;
  subscription = signal<SubscriptionStatus | null>(null);
  isLoading = computed(() => this.userState.loading());
  isLoadingSubscription = signal(true);
  error = computed(() => this.userState.error());
  
  expandedSections = signal<Set<string>>(new Set(['personal', 'address', 'account', 'subscription', 'brands']));

  ngOnInit(): void {
    // User is loaded automatically by UserStateService preflight
    // Ensure user is loaded if not already loaded
    if (!this.userState.isUserLoaded() && !this.userState.loading()) {
      this.userState.loadUser();
    }
    // Only load subscription, user data comes from state
    this.loadSubscription();
  }

  loadSubscription(): void {
    this.isLoadingSubscription.set(true);

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
      this.isLoadingSubscription.set(false);
    });
  }

  refreshUser(): void {
    this.userState.refreshUser();
  }

  toggleSection(section: string): void {
    const current = new Set(this.expandedSections());
    if (current.has(section)) {
      current.delete(section);
    } else {
      current.add(section);
    }
    this.expandedSections.set(current);
  }

  isExpanded(section: string): boolean {
    return this.expandedSections().has(section);
  }

  getTierDisplayName(tier: string): string {
    return this.subscriptionService.getTierDisplayName(tier);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  goToSubscription(): void {
    this.router.navigate(['/subscription']);
  }
}
