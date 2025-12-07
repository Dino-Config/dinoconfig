import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserStateService } from './user-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private http = inject(HttpClient);
  private userState = inject(UserStateService);
  private readonly apiUrl = environment.apiUrl;

  // Signals for auth state
  private _isAuthenticated = signal<boolean | null>(null); // null means "unknown yet"
  private _loading = signal<boolean>(true);

  // Public readonly signals
  readonly isAuthenticated = computed(() => this._isAuthenticated() ?? false);
  readonly loading = this._loading.asReadonly();

  async checkAuthStatus(forceCheck: boolean = false): Promise<void> {
    // Check if we're on a public route
    const publicRoutes = ['/signin', '/signup', '/forgot-password', '/verify-email'];
    const isPublicRoute = typeof window !== 'undefined' && 
      publicRoutes.some(route => window.location.pathname.includes(route));
    
    // Skip validate call on public routes (signin/signup) unless forceCheck is true
    if (isPublicRoute && !forceCheck) {
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
      this.userState.loadUser();
    } catch (error: any) {
      // For now, we'll set to false. Token renewal can be added later if needed
      this._isAuthenticated.set(false);
      this.userState.clearUser();
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

