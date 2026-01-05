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

/** Timer configuration constants */
const TIMER_CONFIG = {
  /** Idle timeout before showing warning (13 minutes) */
  IDLE_TIMEOUT_MS: 13 * 60 * 1000,
  /** Warning countdown duration in seconds (2 minutes) */
  WARNING_DURATION_SECONDS: 2 * 60,
  /** Token renewal check interval (2 minutes) */
  RENEWAL_INTERVAL_MS: 2 * 60 * 1000,
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

  readonly remainingSeconds = signal<number>(0);
  readonly isVisible = signal<boolean>(false);
  readonly isRenewing = signal<boolean>(false);

  readonly formattedRemainingTime = computed(() => {
    const seconds = this.remainingSeconds();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  });

  private readonly sessionExpired$ = new Subject<void>();
  readonly onSessionExpired$ = this.sessionExpired$.asObservable();

  private activityTrackingEnabled = true;
  private lastActivityTime = Date.now();
  private warningDismissed = false;
  private countdownSubscription: Subscription | null = null;
  private readonly renewalComplete$ = new Subject<boolean>();

  private readonly activityEvents = [
    'mousedown',
    'keydown',
    'scroll',
    'touchstart',
    'click',
  ] as const;

  constructor() {
    this.setupActivityTracking();
    this.startTokenRenewalTimer();
  }

  private setupActivityTracking(): void {
    const activityEvents$ = merge(
      ...this.activityEvents.map((eventName) =>
        fromEvent(window, eventName, { passive: true })
      )
    );

    const visibilityChange$ = fromEvent(document, 'visibilitychange').pipe(
      filter(() => !document.hidden)
    );

    merge(activityEvents$, visibilityChange$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onUserActivity());
  }

  private onUserActivity(): void {
    if (!this.activityTrackingEnabled) {
      return;
    }

    const wasIdle = Date.now() - this.lastActivityTime > TIMER_CONFIG.IDLE_TIMEOUT_MS;
    this.lastActivityTime = Date.now();
    this.warningDismissed = false;

    if (wasIdle || this.isVisible()) {
      this.clearIdleWarning();
    }
  }

  disableActivityTracking(): void {
    this.activityTrackingEnabled = false;
  }

  enableActivityTracking(): void {
    this.activityTrackingEnabled = true;
  }

  private clearIdleWarning(): void {
    this.stopCountdown();
    this.remainingSeconds.set(0);
    this.isVisible.set(false);
  }

  private stopCountdown(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = null;
    }
  }

  private checkIdleAndWarn(): void {
    const idleTime = Date.now() - this.lastActivityTime;
    const isIdle = idleTime >= TIMER_CONFIG.IDLE_TIMEOUT_MS;

    if (isIdle && !this.warningDismissed && !this.countdownSubscription) {
      this.showIdleWarning();
    }
  }

  private showIdleWarning(): void {
    this.remainingSeconds.set(TIMER_CONFIG.WARNING_DURATION_SECONDS);
    this.isVisible.set(true);

    this.countdownSubscription = interval(TIMER_CONFIG.COUNTDOWN_INTERVAL_MS)
      .pipe(
        take(TIMER_CONFIG.WARNING_DURATION_SECONDS),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (tick) => {
          const remaining = TIMER_CONFIG.WARNING_DURATION_SECONDS - tick - 1;

          if (remaining <= 0) {
            this.disableActivityTracking();
            this.stopCountdown();
            this.sessionExpired$.next();
            return;
          }

          this.remainingSeconds.set(remaining);
        },
      });
  }

  keepSessionActive(): void {
    this.warningDismissed = true;
    this.clearIdleWarning();
    this.lastActivityTime = Date.now();
    this.forceRenewal().subscribe();
  }

  renewToken(): Observable<TokenRenewalResponse | null> {
    if (this.isRenewing()) {
      return this.renewalComplete$.pipe(
        take(1),
        map((success) => (success ? ({} as TokenRenewalResponse) : null))
      );
    }

    this.isRenewing.set(true);

    return this.http
      .post<TokenRenewalResponse>(
        `${this.apiUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          this.isRenewing.set(false);
          this.renewalComplete$.next(true);
        }),
        catchError(() => {
          this.isRenewing.set(false);
          this.renewalComplete$.next(false);
          return of(null);
        })
      );
  }

  private startTokenRenewalTimer(): void {
    interval(TIMER_CONFIG.RENEWAL_INTERVAL_MS)
      .pipe(
        tap(() => this.checkIdleAndWarn()),
        filter(() => !this.countdownSubscription),
        switchMap(() =>
          this.http.get(`${this.apiUrl}/auth/validate`, { withCredentials: true }).pipe(
            catchError(() => this.renewToken())
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  forceRenewal(): Observable<boolean> {
    return this.renewToken().pipe(map((result) => result !== null));
  }

  stopTokenRenewal(): void {
    this.stopCountdown();
  }
}
