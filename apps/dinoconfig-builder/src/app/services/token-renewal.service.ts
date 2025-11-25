import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface TokenRenewalResponse {
  access_token: string;
  id_token?: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenRenewalService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly homeUrl = environment.homeUrl;

  private renewalTimer: ReturnType<typeof setInterval> | null = null;
  private isRenewing = false;
  private renewalCallbacks: Array<(success: boolean) => void> = [];
  private lastActivityTime: number = Date.now();
  private readonly IDLE_TIMEOUT = 13 * 60 * 1000;
  private readonly WARNING_DURATION = 2 * 60;
  private activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  private idleWarningCallback: ((remainingSeconds: number) => void) | null = null;
  private idleWarningTimer: ReturnType<typeof setInterval> | null = null;
  private warningDismissed = false;

  remainingSeconds = signal<number>(0);
  isVisible = signal<boolean>(false);

  constructor() {
    this.setupActivityTracking();
    this.startTokenRenewalTimer();
  }

  private setupActivityTracking(): void {
    const updateActivity = () => {
      this.lastActivityTime = Date.now();
      this.warningDismissed = false;
      this.clearIdleWarning();
    };

    this.activityEvents.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.lastActivityTime = Date.now();
        this.warningDismissed = false;
        this.clearIdleWarning();
      }
    });
  }

  setIdleWarningCallback(callback: (remainingSeconds: number) => void): void {
    this.idleWarningCallback = callback;
  }

  private clearIdleWarning(): void {
    if (this.idleWarningTimer) {
      clearInterval(this.idleWarningTimer);
      this.idleWarningTimer = null;
    }
    this.remainingSeconds.set(0);
    this.isVisible.set(false);
    if (this.idleWarningCallback) {
      this.idleWarningCallback(0);
    }
  }

  private checkIdleAndWarn(): void {
    const idleTime = Date.now() - this.lastActivityTime;
    
    if (idleTime >= this.IDLE_TIMEOUT && !this.warningDismissed && !this.idleWarningTimer) {
      this.showIdleWarning();
    }
  }

  private showIdleWarning(): void {
    if (!this.idleWarningCallback) return;

    let remainingSeconds = this.WARNING_DURATION;
    this.remainingSeconds.set(remainingSeconds);
    this.isVisible.set(true);
    this.idleWarningCallback(remainingSeconds);

    this.idleWarningTimer = setInterval(() => {
      remainingSeconds--;
      
      if (remainingSeconds <= 0) {
        this.clearIdleWarning();
        window.location.href = this.homeUrl;
        return;
      }

      this.remainingSeconds.set(remainingSeconds);
      if (this.idleWarningCallback) {
        this.idleWarningCallback(remainingSeconds);
      }
    }, 1000);
  }

  async keepSessionActive(): Promise<void> {
    this.warningDismissed = true;
    this.clearIdleWarning();
    this.lastActivityTime = Date.now();
    
    await this.forceRenewal();
  }

  async renewToken(): Promise<TokenRenewalResponse | null> {
    if (this.isRenewing) {
      return new Promise((resolve) => {
        this.renewalCallbacks.push((success) => {
          resolve(success ? { access_token: '', expires_in: 0 } : null);
        });
      });
    }

    this.isRenewing = true;

    try {
      const response = await firstValueFrom(
        this.http.post<TokenRenewalResponse>(
          `${this.apiUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        )
      );

      this.isRenewing = false;
      this.notifyCallbacks(true);
      return response;
    } catch (error) {
      console.error('Token renewal failed:', error);
      this.isRenewing = false;
      this.notifyCallbacks(false);
      return null;
    }
  }

  private startTokenRenewalTimer(): void {
    this.renewalTimer = setInterval(async () => {
      this.checkIdleAndWarn();

      if (!this.idleWarningTimer) {
        try {
          await firstValueFrom(
            this.http.get(`${this.apiUrl}/auth/validate`, { 
              withCredentials: true 
            })
          );
        } catch (error) {
          const renewed = await this.renewToken();
          if (!renewed) {
            console.error('Token renewal failed, user may need to re-authenticate');
          }
        }
      }
    }, 2 * 60 * 1000);
  }

  stopTokenRenewal(): void {
    if (this.renewalTimer) {
      clearInterval(this.renewalTimer);
      this.renewalTimer = null;
    }
  }

  private notifyCallbacks(success: boolean): void {
    this.renewalCallbacks.forEach(callback => callback(success));
    this.renewalCallbacks = [];
  }

  async forceRenewal(): Promise<boolean> {
    const result = await this.renewToken();
    return result !== null;
  }
}

