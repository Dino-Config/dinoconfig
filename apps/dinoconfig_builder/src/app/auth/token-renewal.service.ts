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

  constructor() {
    this.startTokenRenewalTimer();
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
    // Check every 10 minutes (600000ms)
    this.renewalTimer = setInterval(async () => {
      try {
        // Test if current token is still valid
        await axios.get(`${environment.apiUrl}/auth/validate`, { 
          withCredentials: true,
          timeout: 5000 // 5 second timeout
        });
      } catch (error) {
        // If validation fails, try to renew the token
        console.log('Token validation failed, attempting renewal...');
        const renewed = await this.renewToken();
        if (!renewed) {
          console.error('Token renewal failed, user may need to re-authenticate');
          // Could dispatch an event or callback here to handle re-authentication
        }
      }
    }, 10 * 60 * 1000); // 10 minutes
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
