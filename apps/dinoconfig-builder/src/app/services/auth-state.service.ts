import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserStateService } from './user-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private http = inject(HttpClient);
  private userState = inject(UserStateService);
  private router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  // Signals for auth state
  private _isAuthenticated = signal<boolean | null>(null); // null means "unknown yet"
  private _loading = signal<boolean>(true);

  // Public readonly signals
  readonly isAuthenticated = computed(() => this._isAuthenticated() ?? false);
  readonly loading = this._loading.asReadonly();

  async checkAuthStatus(forceCheck: boolean = false): Promise<void> {
    // Check if we're on a public route or root path (which redirects to signin)
    const publicRoutes = ['/signin', '/signup', '/forgot-password', '/verify-email'];
    const currentUrl = this.router.url;
    const isPublicRoute = currentUrl === '/' || publicRoutes.some(route => currentUrl.includes(route));
    
    // Skip validate call on public routes (signin/signup) or root path unless forceCheck is true
    if (isPublicRoute && !forceCheck) {
      this._isAuthenticated.set(false);
      this._loading.set(false);
      // Only clear user on public routes if explicitly cleared (after logout)
      if (this.userState.isExplicitlyCleared()) {
        this.userState.clearUser();
      }
      return;
    }
    
    // Don't check if user was explicitly cleared (after logout)
    if (this.userState.isExplicitlyCleared()) {
      this._isAuthenticated.set(false);
      this._loading.set(false);
      return;
    }
    
    try {
      await firstValueFrom(this.http.get(`${this.apiUrl}/auth/validate`, { 
        withCredentials: true 
      }));
      this._isAuthenticated.set(true);
      // Preflight: Load user data once authentication is confirmed
      // Only load if not on a public route
      if (!isPublicRoute) {
        // Ensure user is loaded - loadUser will skip if already loaded
        await this.userState.loadUser();
      }
    } catch (error: any) {
      // Only clear user on actual auth failures (401/403), not on network errors
      if (error.status === 401 || error.status === 403) {
        this._isAuthenticated.set(false);
        this.userState.clearUser();
      } else {
        // For other errors, don't clear user - might be a temporary network issue
        // Just set loading to false
        console.error('Auth check error:', error);
      }
    } finally {
      this._loading.set(false);
    }
  }

  constructor() {
    // Use setTimeout to avoid calling in constructor
    setTimeout(() => {
      this.checkAuthStatus();
    }, 0);
  }

  async refreshAuth(forceCheck: boolean = false): Promise<void> {
    await this.checkAuthStatus(forceCheck);
  }

  /**
   * Set logout state without making API calls
   * Used when logout is explicitly called
   */
  setLoggedOut(): void {
    this._isAuthenticated.set(false);
    this._loading.set(false);
    this.userState.clearUser();
  }
}

