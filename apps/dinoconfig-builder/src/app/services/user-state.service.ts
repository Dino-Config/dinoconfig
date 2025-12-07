import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Signals for user state
  private _user = signal<User | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _explicitlyCleared = signal<boolean>(false); // Track if user was explicitly cleared (e.g., logout)

  // Public readonly signals
  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly isUserLoaded = computed(() => this._user() !== null);

  /**
   * Preflight call - loads user data once at app initialization
   * Should be called after authentication is confirmed
   */
  async loadUser(forceRefresh: boolean = false): Promise<void> {
    // Skip if already loading
    if (this._loading() && !forceRefresh) {
      return;
    }

    // Skip if user is already loaded and not forcing refresh
    if (this._user() !== null && !forceRefresh) {
      return;
    }

    // If user was explicitly cleared (e.g., after logout), don't make the call
    // This prevents unnecessary API calls after logout
    if (!forceRefresh && this._explicitlyCleared()) {
      return;
    }

    try {
      this._loading.set(true);
      this._error.set(null);
      this._explicitlyCleared.set(false); // Reset flag when loading
      
      const user = await firstValueFrom(
        this.http.get<User>(`${this.apiUrl}/users`, {
          withCredentials: true
        })
      );
      
      this._user.set(user);
      this._explicitlyCleared.set(false);
    } catch (error: any) {
      // If not authenticated, the HTTP call will fail - this is expected
      // Clear user data on authentication errors
      if (error.status === 401 || error.status === 403) {
        this._user.set(null);
        // Don't set error for auth failures - they're expected after logout
        this._error.set(null);
        return;
      }
      console.error('Failed to load user:', error);
      this._error.set(error.error?.message || 'Failed to load user data');
      this._user.set(null);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Set user data directly (e.g., from login response)
   */
  setUser(user: User | null): void {
    this._user.set(user);
    this._error.set(null);
    this._explicitlyCleared.set(false); // Reset flag when setting user
  }

  /**
   * Clear user data (e.g., on logout)
   */
  clearUser(): void {
    this._user.set(null);
    this._error.set(null);
    this._loading.set(false);
    this._explicitlyCleared.set(true); // Mark as explicitly cleared to prevent auto-loading
  }

  /**
   * Refresh user data from server
   */
  async refreshUser(): Promise<void> {
    await this.loadUser(true);
  }

  constructor() {
    // Watch for authentication changes and load user when authenticated
    // Use effect-like behavior by subscribing to auth state changes
    // Note: In Angular, we'll trigger this from AuthStateService instead
  }
}

