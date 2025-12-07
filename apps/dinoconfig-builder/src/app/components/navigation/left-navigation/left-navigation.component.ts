import { Component, input, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserStateService } from '../../../services/user-state.service';
import { AuthService } from '../../../services/auth.service';
import { AuthStateService } from '../../../services/auth-state.service';
import { LimitViolationService } from '../../../services/limit-violation.service';
import { environment } from '../../../../environments/environment';
import { User } from '../../../models/user.models';
import { SubscriptionStatus } from '../../../models/subscription.models';
import { filter } from 'rxjs';
import { SubscriptionTierBoxComponent } from '../../shared/subscription-tier-box/subscription-tier-box.component';
import { UserInfoComponent } from '../../shared/user-info/user-info.component';
import { NavMenuItemComponent } from '../../shared/nav-menu-item/nav-menu-item.component';

@Component({
  selector: 'dc-left-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    SubscriptionTierBoxComponent,
    UserInfoComponent,
    NavMenuItemComponent
  ],
  templateUrl: './left-navigation.component.html',
  styleUrl: './left-navigation.component.scss'
})
export class LeftNavigationComponent implements OnInit {
  router = inject(Router);
  private userState = inject(UserStateService);
  private authService = inject(AuthService);
  private authState = inject(AuthStateService);
  private limitViolationService = inject(LimitViolationService);

  isCollapsed = input<boolean>(false);
  onToggle = input<() => void>(() => {});

  user = this.userState.user;
  // Use subscription data from LimitViolationService to avoid duplicate API calls
  subscription = computed<SubscriptionStatus | null>(() => {
    const violations = this.limitViolationService.violations();
    if (!violations) return null;
    // LimitViolationsResult extends SubscriptionStatus, so we can use it directly
    return {
      tier: violations.tier,
      status: violations.status,
      limits: violations.limits,
      features: violations.features,
      currentPeriodEnd: violations.currentPeriodEnd,
      isActive: violations.isActive
    };
  });
  loading = computed(() => this.userState.loading() || this.limitViolationService.loading());

  currentPath = signal<string>('');

  ngOnInit(): void {
    // User is loaded automatically by UserStateService preflight
    // Subscription data is loaded by LimitViolationService, no need to load it here

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentPath.set(this.router.url);
    });
    
    this.currentPath.set(this.router.url);
  }

  goBuilder(): void {
    const lastBrandId = localStorage.getItem('lastBrandId');
    if (!lastBrandId) {
      this.router.navigate(['/brands']);
      return;
    }
    this.router.navigate(['/brands', lastBrandId, 'builder']);
  }

  goProfile(): void {
    this.router.navigate(['/profile']);
  }

  goSettings(): void {
    this.router.navigate(['/settings']);
  }

  goSettingsSdk(): void {
    this.router.navigate(['/settings/sdk']);
  }

  goSettingsFeatures(): void {
    this.router.navigate(['/settings/features']);
  }

  handleLogout(): void {
    localStorage.clear();
    sessionStorage.clear();

    this.authService.logout().subscribe({
      next: () => {
        window.location.href = `${environment.homeUrl}/signin`;
      },
      error: () => {
        window.location.href = `${environment.homeUrl}/signin`;
      }
    });
  }

  isActive(path: string): boolean {
    return this.currentPath().startsWith(path);
  }

  getActiveItem(): 'builder' | 'profile' | 'settings' {
    const path = this.currentPath();
    if (path.startsWith('/builder')) return 'builder';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/settings')) return 'settings';
    return 'builder';
  }
}
