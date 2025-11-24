import { Component, input, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../services/user.service';
import { SubscriptionService } from '../../../services/subscription.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { User } from '../../../models/user.models';
import { SubscriptionStatus } from '../../../models/subscription.models';
import { catchError, of, filter } from 'rxjs';
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
  private userService = inject(UserService);
  private subscriptionService = inject(SubscriptionService);
  private authService = inject(AuthService);

  isCollapsed = input<boolean>(false);
  onToggle = input<() => void>(() => {});

  user = signal<User | null>(null);
  subscription = signal<SubscriptionStatus | null>(null);
  loading = signal<boolean>(true);

  currentPath = signal<string>('');

  ngOnInit(): void {
    this.loadUser();
    this.loadSubscription();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentPath.set(this.router.url);
    });
    
    this.currentPath.set(this.router.url);
  }

  private loadUser(): void {
    this.userService.getUser().pipe(
      catchError(() => of(null))
    ).subscribe(user => {
      this.user.set(user);
      this.loading.set(false);
    });
  }

  private loadSubscription(): void {
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
    });
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
        window.location.href = environment.homeUrl;
      },
      error: () => {
        window.location.href = environment.homeUrl;
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
