import axios from 'axios';
import { environment } from '../../environments';

export interface TokenRenewalResponse {
  access_token: string;
  id_token?: string;
  expires_in: number;
}

export class TokenRenewalService {
  private renewalTimer: NodeJS.Timeout | null = null;
  private isRenewing = false;
  private renewalCallbacks: Array<(success: boolean) => void> = [];
  private lastActivityTime: number = Date.now();
  private readonly IDLE_TIMEOUT = 13 * 60 * 1000; // 13 minutes (show warning before 15 min token expiry)
  private readonly WARNING_DURATION = 2 * 60; // 2 minutes warning countdown
  private activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  private idleWarningCallback: ((remainingSeconds: number) => void) | null = null;
  private idleWarningTimer: NodeJS.Timeout | null = null;
  private warningDismissed = false;

  constructor() {
    this.setupActivityTracking();
    this.startTokenRenewalTimer();
  }

  /**
   * Setup activity tracking to detect user interaction
   */
  private setupActivityTracking(): void {
    const updateActivity = () => {
      this.lastActivityTime = Date.now();
      this.warningDismissed = false;
      this.clearIdleWarning();
    };

    // Track user activity
    this.activityEvents.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Also track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.lastActivityTime = Date.now();
        this.warningDismissed = false;
        this.clearIdleWarning();
      }
    });
  }

  /**
   * Register callback for idle warning
   */
  setIdleWarningCallback(callback: (remainingSeconds: number) => void): void {
    this.idleWarningCallback = callback;
  }

  /**
   * Clear idle warning
   */
  private clearIdleWarning(): void {
    if (this.idleWarningTimer) {
      clearInterval(this.idleWarningTimer);
      this.idleWarningTimer = null;
    }
    if (this.idleWarningCallback) {
      this.idleWarningCallback(0); // Signal to hide warning
    }
  }

  /**
   * Check if user has been idle and show warning if needed
   */
  private checkIdleAndWarn(): void {
    const idleTime = Date.now() - this.lastActivityTime;
    
    // If user has been idle for IDLE_TIMEOUT, show warning
    if (idleTime >= this.IDLE_TIMEOUT && !this.warningDismissed && !this.idleWarningTimer) {
      this.showIdleWarning();
    }
  }

  /**
   * Show idle warning with countdown
   */
  private showIdleWarning(): void {
    if (!this.idleWarningCallback) return;

    let remainingSeconds = this.WARNING_DURATION;
    this.idleWarningCallback(remainingSeconds);

    this.idleWarningTimer = setInterval(() => {
      remainingSeconds--;
      
      if (remainingSeconds <= 0) {
        this.clearIdleWarning();
        // Redirect to home (logout)
        window.location.href = environment.homeUrl;
        return;
      }

      if (this.idleWarningCallback) {
        this.idleWarningCallback(remainingSeconds);
      }
    }, 1000);
  }

  /**
   * User clicked "Keep Session" - renew token and reset activity
   */
  async keepSessionActive(): Promise<void> {
    this.warningDismissed = true;
    this.clearIdleWarning();
    this.lastActivityTime = Date.now();
    
    // Force token renewal
    await this.forceRenewal();
  }

  /**
   * Check if the current token is expired or will expire soon
   */
  private isTokenExpiredOrExpiringSoon(): boolean {
    // Since we can't access the token directly from cookies in the frontend,
    // we'll rely on API calls to determine if renewal is needed
    return false; // This will be handled by the API response
  }

  /**
   * Attempt to renew the token using the refresh token
   */
  async renewToken(): Promise<TokenRenewalResponse | null> {
    if (this.isRenewing) {
      // If already renewing, wait for the current renewal to complete
      return new Promise((resolve) => {
        this.renewalCallbacks.push((success) => {
          resolve(success ? { access_token: '', expires_in: 0 } : null);
        });
      });
    }

    this.isRenewing = true;

    try {
      const response = await axios.post<TokenRenewalResponse>(
        `${environment.apiUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      this.isRenewing = false;
      this.notifyCallbacks(true);
      return response.data;
    } catch (error) {
      console.error('Token renewal failed:', error);
      this.isRenewing = false;
      this.notifyCallbacks(false);
      return null;
    }
  }

  /**
   * Start a timer to periodically check and renew tokens
   */
  private startTokenRenewalTimer(): void {
    this.renewalTimer = setInterval(async () => {
      // Check if user is idle and should see warning
      this.checkIdleAndWarn();

      // Only validate/renew if not showing warning
      if (!this.idleWarningTimer) {
        try {
          // Test if current token is still valid
          await axios.get(`${environment.apiUrl}/auth/validate`, { 
            withCredentials: true,
            timeout: 5000 // 5 second timeout
          });
        } catch (error) {
          // If validation fails, try to renew the token
          const renewed = await this.renewToken();
          if (!renewed) {
            console.error('Token renewal failed, user may need to re-authenticate');
          }
        }
      }
    }, 2 * 60 * 1000);
  }

  /**
   * Stop the renewal timer
   */
  stopTokenRenewal(): void {
    if (this.renewalTimer) {
      clearInterval(this.renewalTimer);
      this.renewalTimer = null;
    }
  }

  /**
   * Notify all waiting callbacks
   */
  private notifyCallbacks(success: boolean): void {
    this.renewalCallbacks.forEach(callback => callback(success));
    this.renewalCallbacks = [];
  }

  /**
   * Force a token renewal (useful for immediate renewal before API calls)
   */
  async forceRenewal(): Promise<boolean> {
    const result = await this.renewToken();
    return result !== null;
  }
}

// Export a singleton instance
export const tokenRenewalService = new TokenRenewalService();
