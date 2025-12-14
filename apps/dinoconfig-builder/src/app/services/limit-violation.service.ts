import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, catchError, of } from 'rxjs';
import { SubscriptionService } from './subscription.service';
import { AuthStateService } from './auth-state.service';
import { UserStateService } from './user-state.service';
import { LimitViolationsResult } from '../models/subscription.models';

@Injectable({
  providedIn: 'root'
})
export class LimitViolationService {
  private router = inject(Router);
  private subscriptionService = inject(SubscriptionService);
  private authState = inject(AuthStateService);
  private userState = inject(UserStateService);

  private _violations = signal<LimitViolationsResult | null>(null);
  private _loading = signal<boolean>(false);
  private _showModal = signal<boolean>(false);
  private _currentPath = signal<string>('');

  readonly violations = this._violations.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly showModal = computed(() => {
    const violations = this._violations();
    const path = this._currentPath();
    
    if (this._loading()) return false;
    if (!violations?.hasViolations) return false;
    if (path === '/subscription' || path === '/subscription/success') return false;
    
    return this._showModal();
  });

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this._currentPath.set(this.router.url);
    });

    this._currentPath.set(this.router.url);

    effect(() => {
      const violations = this._violations();
      const path = this._currentPath();
      
      if (!this._loading() && violations?.hasViolations) {
        if (path !== '/subscription' && path !== '/subscription/success') {
          this._showModal.set(true);
        } else {
          this._showModal.set(false);
        }
      }
    });

    effect(() => {
      const path = this._currentPath();
      if (path === '/subscription' || path === '/subscription/success') {
        this._showModal.set(false);
      }
    });

    // Watch for authentication state changes and check violations when authenticated
    effect(() => {
      const isAuthenticated = this.authState.isAuthenticated();
      const isExplicitlyCleared = this.userState.isExplicitlyCleared();
      
      // Only check violations if user is authenticated, not explicitly cleared,
      // not already loading, and we don't already have violations data
      if (isAuthenticated && !isExplicitlyCleared && !this._loading() && !this._violations()) {
        this.checkViolations();
      } else if (!isAuthenticated || isExplicitlyCleared) {
        // Clear violations when logged out
        this._violations.set(null);
        this._showModal.set(false);
      }
    });
  }

  checkViolations(): void {
    // Double check authentication before making the call
    if (!this.authState.isAuthenticated() || this.userState.isExplicitlyCleared()) {
      this._loading.set(false);
      return;
    }

    this._loading.set(true);
    this.subscriptionService.getSubscriptionWithViolations().pipe(
      catchError(() => {
        return of(null);
      })
    ).subscribe(result => {
      this._violations.set(result);
      this._loading.set(false);
    });
  }

  refreshViolations(): void {
    this.checkViolations();
  }
}

