import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../environments/environment';
import {
  Observable,
  Subject,
  Subscription,
  catchError,
  filter,
  fromEvent,
  interval,
  map,
  merge,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';

export interface TokenRenewalResponse {
  access_token: string;
  id_token?: string;
  expires_in: number;
}

/** Time constants for testing - reduce these values for quick testing */
const TIMER_CONFIG = {
  /** Idle timeout before showing warning (10 seconds for testing, use 13 * 60 * 1000 for production) */
  IDLE_TIMEOUT_MS: 10 * 1000,
  /** Warning countdown duration in seconds (15 seconds for testing, use 2 * 60 for production) */
  WARNING_DURATION_SECONDS: 15,
  /** Token renewal check interval (5 seconds for testing, use 2 * 60 * 1000 for production) */
  RENEWAL_INTERVAL_MS: 5 * 1000,
  /** Warning countdown tick interval */
  COUNTDOWN_INTERVAL_MS: 1000,
} as const;

@Injectable({
  providedIn: 'root',
})
export class TokenRenewalService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private readonly apiUrl = environment.apiUrl;
  private readonly homeUrl = environment.homeUrl;

  /** Signals for reactive state */
  readonly remainingSeconds = signal<number>(0);
  readonly isVisible = signal<boolean>(false);
  readonly isRenewing = signal<boolean>(false);

  /** Flag to temporarily disable activity tracking (e.g., during logout) */
  private activityTrackingEnabled = true;

  /** Subject emitted when session expires - components should subscribe to handle logout */
  private readonly sessionExpired$ = new Subject<void>();
  readonly onSessionExpired$ = this.sessionExpired$.asObservable();

  /** Computed signal to format remaining time */
  readonly formattedRemainingTime = computed(() => {
    const seconds = this.remainingSeconds();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  });

  /** Internal state */
  private lastActivityTime = Date.now();
  private warningDismissed = false;
  private countdownSubscription: Subscription | null = null;

  /** Subject for renewal coordination */
  private readonly renewalComplete$ = new Subject<boolean>();

  /** Activity events to track */
  private readonly activityEvents = [
    'mousedown',
    'keydown',
    'scroll',
    'touchstart',
    'click',
  ] as const;

  constructor() {
    console.log('[TokenRenewalService] Initializing service with config:', TIMER_CONFIG);
    this.setupActivityTracking();
    this.startTokenRenewalTimer();
  }

  /**
   * Sets up activity tracking using RxJS fromEvent
   * Merges all activity events into a single stream
   */
  private setupActivityTracking(): void {
    console.log('[TokenRenewalService] Setting up activity tracking');

    // Merge all activity events from window
    const activityEvents$ = merge(
      ...this.activityEvents.map((eventName) =>
        fromEvent(window, eventName, { passive: true })
      )
    );

    // Handle visibility change separately
    const visibilityChange$ = fromEvent(document, 'visibilitychange').pipe(
      filter(() => !document.hidden)
    );

    // Merge all activity sources and handle them
    merge(activityEvents$, visibilityChange$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.onUserActivity();
      });
  }

  /**
   * Handles user activity - resets idle state
   */
  private onUserActivity(): void {
    // Skip if activity tracking is disabled (e.g., during logout)
    if (!this.activityTrackingEnabled) {
      console.log('[TokenRenewalService] Activity tracking disabled, ignoring activity');
      return;
    }

    const wasIdle = Date.now() - this.lastActivityTime > TIMER_CONFIG.IDLE_TIMEOUT_MS;
    this.lastActivityTime = Date.now();
    this.warningDismissed = false;

    if (wasIdle || this.isVisible()) {
      console.log('[TokenRenewalService] User activity detected, clearing idle warning');
      this.clearIdleWarning();
    }
  }

  /**
   * Disables activity tracking - call before logout to prevent interference
   */
  disableActivityTracking(): void {
    console.log('[TokenRenewalService] Activity tracking disabled');
    this.activityTrackingEnabled = false;
  }

  /**
   * Re-enables activity tracking
   */
  enableActivityTracking(): void {
    console.log('[TokenRenewalService] Activity tracking enabled');
    this.activityTrackingEnabled = true;
  }

  /**
   * Clears the idle warning and stops countdown
   */
  private clearIdleWarning(): void {
    console.log('[TokenRenewalService] Clearing idle warning');

    this.stopCountdown();
    this.remainingSeconds.set(0);
    this.isVisible.set(false);
  }

  /**
   * Stops the countdown subscription
   */
  private stopCountdown(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = null;
      console.log('[TokenRenewalService] Countdown stopped');
    }
  }

  /**
   * Checks if user is idle and shows warning if needed
   */
  private checkIdleAndWarn(): void {
    const idleTime = Date.now() - this.lastActivityTime;
    const isIdle = idleTime >= TIMER_CONFIG.IDLE_TIMEOUT_MS;

    console.log('[TokenRenewalService] Idle check - idle time:', idleTime, 'ms, isIdle:', isIdle);

    if (isIdle && !this.warningDismissed && !this.countdownSubscription) {
      console.log('[TokenRenewalService] User is idle, showing warning');
      this.showIdleWarning();
    }
  }

  /**
   * Shows idle warning with countdown using RxJS interval
   */
  private showIdleWarning(): void {
    console.log('[TokenRenewalService] Starting idle warning countdown');

    this.remainingSeconds.set(TIMER_CONFIG.WARNING_DURATION_SECONDS);
    this.isVisible.set(true);

    // Use RxJS interval for countdown
    this.countdownSubscription = interval(TIMER_CONFIG.COUNTDOWN_INTERVAL_MS)
      .pipe(
        take(TIMER_CONFIG.WARNING_DURATION_SECONDS),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (tick) => {
          const remaining = TIMER_CONFIG.WARNING_DURATION_SECONDS - tick - 1;
          console.log('[TokenRenewalService] Countdown tick:', remaining, 'seconds remaining');

          if (remaining <= 0) {
            console.log('[TokenRenewalService] Session expired, emitting session expired event');
            this.disableActivityTracking();
            this.stopCountdown();
            this.sessionExpired$.next();
            return;
          }

          this.remainingSeconds.set(remaining);
        },
        complete: () => {
          console.log('[TokenRenewalService] Countdown complete');
        },
      });
  }

  /**
   * Keeps the session active - called when user wants to stay logged in
   */
  keepSessionActive(): void {
    console.log('[TokenRenewalService] User requested to keep session active');

    this.warningDismissed = true;
    this.clearIdleWarning();
    this.lastActivityTime = Date.now();

    this.forceRenewal().subscribe({
      next: (success: boolean) => {
        console.log('[TokenRenewalService] Session renewal result:', success);
      },
      error: (err: unknown) => {
        console.error('[TokenRenewalService] Session renewal error:', err);
      },
    });
  }

  /**
   * Renews the token using RxJS observables
   * Handles concurrent renewal requests by returning the same observable
   */
  renewToken(): Observable<TokenRenewalResponse | null> {
    console.log('[TokenRenewalService] Token renewal requested, isRenewing:', this.isRenewing());

    if (this.isRenewing()) {
      console.log('[TokenRenewalService] Renewal already in progress, waiting for completion');
      return this.renewalComplete$.pipe(
        take(1),
        map((success) => (success ? ({} as TokenRenewalResponse) : null))
      );
    }

    this.isRenewing.set(true);
    console.log('[TokenRenewalService] Starting token renewal');

    return this.http
      .post<TokenRenewalResponse>(
        `${this.apiUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          console.log('[TokenRenewalService] Token renewal successful:', response);
          this.isRenewing.set(false);
          this.renewalComplete$.next(true);
        }),
        catchError((error: unknown) => {
          console.error('[TokenRenewalService] Token renewal failed:', error);
          this.isRenewing.set(false);
          this.renewalComplete$.next(false);
          return of(null);
        })
      );
  }

  /**
   * Starts the token renewal timer using RxJS interval
   */
  private startTokenRenewalTimer(): void {
    console.log('[TokenRenewalService] Starting token renewal timer, interval:', TIMER_CONFIG.RENEWAL_INTERVAL_MS, 'ms');

    interval(TIMER_CONFIG.RENEWAL_INTERVAL_MS)
      .pipe(
        tap(() => {
          console.log('[TokenRenewalService] Renewal timer tick');
          this.checkIdleAndWarn();
        }),
        filter(() => !this.countdownSubscription),
        switchMap(() => {
          console.log('[TokenRenewalService] Validating token');
          return this.http.get(`${this.apiUrl}/auth/validate`, {
            withCredentials: true,
          }).pipe(
            tap(() => {
              console.log('[TokenRenewalService] Token is valid');
            }),
            catchError((error) => {
              console.log('[TokenRenewalService] Token validation failed, attempting renewal:', error.status);
              return this.renewToken();
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (result) => {
          console.log('[TokenRenewalService] Timer cycle complete, result:', result);
        },
        error: (error) => {
          console.error('[TokenRenewalService] Timer error:', error);
        },
      });
  }

  /**
   * Force token renewal
   * Returns an observable that emits true on success, false on failure
   */
  forceRenewal(): Observable<boolean> {
    console.log('[TokenRenewalService] Force renewal requested');

    return this.renewToken().pipe(
      map((result) => result !== null)
    );
  }

  /**
   * Stops all timers - useful for cleanup
   * Note: With takeUntilDestroyed, this is automatically handled on destroy
   */
  stopTokenRenewal(): void {
    console.log('[TokenRenewalService] Stopping token renewal');
    this.stopCountdown();
  }
}
