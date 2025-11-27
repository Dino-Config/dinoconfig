import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, catchError, of } from 'rxjs';
import { SubscriptionService } from './subscription.service';
import { LimitViolationsResult } from '../models/subscription.models';

@Injectable({
  providedIn: 'root'
})
export class LimitViolationService {
  private router = inject(Router);
  private subscriptionService = inject(SubscriptionService);

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

    this.checkViolations();
  }

  checkViolations(): void {
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

