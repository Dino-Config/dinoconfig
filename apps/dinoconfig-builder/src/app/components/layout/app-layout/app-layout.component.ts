import { Component, signal, computed, inject, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';
import { LeftNavigationComponent } from '../../navigation/left-navigation/left-navigation.component';
import { SubscriptionViolationModalComponent } from '../../shared/subscription-violation-modal/subscription-violation-modal.component';
import { IdleWarningModalComponent } from '../../shared/idle-warning-modal/idle-warning-modal.component';
import { LimitViolationService } from '../../../services/limit-violation.service';
import { TokenRenewalService } from '../../../services/token-renewal.service';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'dc-app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    LeftNavigationComponent,
    SubscriptionViolationModalComponent,
    IdleWarningModalComponent
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly limitViolationService = inject(LimitViolationService);
  private readonly tokenRenewalService = inject(TokenRenewalService);
  private readonly authService = inject(AuthService);

  isCollapsed = signal(false);

  activeItem = computed<'builder' | 'profile' | 'settings'>(() => {
    const path = this.currentPath();
    if (path.startsWith('/builder')) return 'builder';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/settings')) return 'settings';
    return 'builder';
  });

  currentPath = signal<string>('');
  showViolationModal = computed(() => this.limitViolationService.showModal());
  violations = computed(() => this.limitViolationService.violations());
  idleVisible = computed(() => this.tokenRenewalService.isVisible());
  idleRemainingSeconds = computed(() => this.tokenRenewalService.remainingSeconds());

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.currentPath.set(this.router.url);
    });
    
    this.currentPath.set(this.router.url);

    // Subscribe to session expired event for automatic logout
    this.tokenRenewalService.onSessionExpired$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        console.log('[AppLayoutComponent] Session expired, performing logout');
        this.performLogout();
      });

    effect(() => {
      const path = this.currentPath();
      if (path === '/subscription/success') {
        this.limitViolationService.refreshViolations();
      }
    });
  }

  toggleSidebar(): void {
    this.isCollapsed.update(value => !value);
  }

  getSidenavWidth(): string {
    return this.isCollapsed() ? '72px' : '280px';
  }

  handleKeepSession(): void {
    this.tokenRenewalService.keepSessionActive();
  }

  handleLogout(): void {
    console.log('[AppLayoutComponent] User requested logout');
    // Disable activity tracking to prevent interference
    this.tokenRenewalService.disableActivityTracking();
    this.tokenRenewalService.stopTokenRenewal();
    this.performLogout();
  }

  private async performLogout(): Promise<void> {
    console.log('[AppLayoutComponent] Performing logout');

    // Clear storage
    localStorage.clear();
    sessionStorage.clear();

    try {
      await firstValueFrom(this.authService.logout());
      console.log('[AppLayoutComponent] Logout API call successful');
    } catch (error) {
      console.error('[AppLayoutComponent] Logout API call failed:', error);
    }

    // Redirect to signin page
    window.location.href = `${environment.homeUrl}/signin`;
  }
}

