import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/user.service';
import { SubscriptionService } from '../../services/subscription.service';
import { User } from '../../models/user.models';
import { SubscriptionStatus } from '../../models/subscription.models';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'dc-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SpinnerComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private subscriptionService = inject(SubscriptionService);

  user = signal<User | null>(null);
  subscription = signal<SubscriptionStatus | null>(null);
  isLoading = signal(true);
  isLoadingSubscription = signal(true);
  error = signal<string | null>(null);
  
  expandedSections = signal<Set<string>>(new Set(['personal', 'address', 'account', 'subscription', 'brands']));

  ngOnInit(): void {
    this.loadUser();
    this.loadSubscription();
  }

  loadUser(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.userService.getUser().pipe(
      catchError((err: any) => {
        this.error.set(err.error?.message || 'Failed to load profile information');
        return of(null);
      })
    ).subscribe(data => {
      if (data) {
        this.user.set(data);
      }
      this.isLoading.set(false);
    });
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
    this.loadUser();
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
