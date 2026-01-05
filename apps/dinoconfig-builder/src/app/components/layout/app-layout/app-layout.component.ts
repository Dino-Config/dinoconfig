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
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'dc-app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    LeftNavigationComponent,
    SubscriptionViolationModalComponent,
    IdleWarningModalComponent,
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly limitViolationService = inject(LimitViolationService);
  private readonly tokenRenewalService = inject(TokenRenewalService);
  private readonly authService = inject(AuthService);

  isCollapsed = signal(false);
  currentPath = signal<string>('');

  activeItem = computed<'builder' | 'profile' | 'settings'>(() => {
    const path = this.currentPath();
    if (path.startsWith('/builder')) return 'builder';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/settings')) return 'settings';
    return 'builder';
  });

  showViolationModal = computed(() => this.limitViolationService.showModal());
  violations = computed(() => this.limitViolationService.violations());
  idleVisible = computed(() => this.tokenRenewalService.isVisible());
  idleRemainingSeconds = computed(() => this.tokenRenewalService.remainingSeconds());

  constructor() {
    this.currentPath.set(this.router.url);

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.currentPath.set(this.router.url));

    this.tokenRenewalService.onSessionExpired$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.performLogout());

    effect(() => {
      if (this.currentPath() === '/subscription/success') {
        this.limitViolationService.refreshViolations();
      }
    });
  }

  toggleSidebar(): void {
    this.isCollapsed.update((value) => !value);
  }

  getSidenavWidth(): string {
    return this.isCollapsed() ? '72px' : '280px';
  }

  handleKeepSession(): void {
    this.tokenRenewalService.keepSessionActive();
  }

  handleLogout(): void {
    this.tokenRenewalService.disableActivityTracking();
    this.tokenRenewalService.stopTokenRenewal();
    this.performLogout();
  }

  private async performLogout(): Promise<void> {
    localStorage.clear();
    sessionStorage.clear();

    try {
      await firstValueFrom(this.authService.logout());
    } catch {
      // Ignore logout API errors, proceed with redirect
    }

    window.location.href = `${environment.homeUrl}/signin`;
  }
}
