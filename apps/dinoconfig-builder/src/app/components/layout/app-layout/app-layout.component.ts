import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { filter } from 'rxjs';
import { LeftNavigationComponent } from '../../navigation/left-navigation/left-navigation.component';
import { SubscriptionViolationModalComponent } from '../../shared/subscription-violation-modal/subscription-violation-modal.component';
import { IdleWarningModalComponent } from '../../shared/idle-warning-modal/idle-warning-modal.component';
import { LimitViolationService } from '../../../services/limit-violation.service';
import { TokenRenewalService } from '../../../services/token-renewal.service';
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
    IdleWarningModalComponent
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {
  private router = inject(Router);
  private limitViolationService = inject(LimitViolationService);
  private tokenRenewalService = inject(TokenRenewalService);

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
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentPath.set(this.router.url);
    });
    
    this.currentPath.set(this.router.url);

    this.tokenRenewalService.setIdleWarningCallback((seconds) => {
      if (seconds > 0) {
        this.tokenRenewalService.remainingSeconds.set(seconds);
        this.tokenRenewalService.isVisible.set(true);
      } else {
        this.tokenRenewalService.isVisible.set(false);
        this.tokenRenewalService.remainingSeconds.set(0);
      }
    });

    effect(() => {
      const path = this.currentPath();
      if (path === '/subscription/success') {
        setTimeout(() => {
          this.limitViolationService.refreshViolations();
        }, 2000);
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
    window.location.href = `${environment.homeUrl}/signin`;
  }
}

