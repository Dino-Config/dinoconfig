import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  // Signals
  private _currentUser = signal<User | null>(null);
  private _isAuthenticated = signal<boolean>(false);
  private _isLoading = signal<boolean>(false);

  // Computed signals
  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = this._isAuthenticated.asReadonly();
  public isLoading = this._isLoading.asReadonly();

  constructor() {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = this.getToken();
    const user = this.getUser();
    
    if (token && user) {
      this._currentUser.set(user);
      this._isAuthenticated.set(true);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setSession(response);
          this._currentUser.set(response.user);
          this._isAuthenticated.set(true);
          this._isLoading.set(false);
        }),
        catchError(error => {
          this._isLoading.set(false);
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  signup(userData: SignupRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/signup`, userData)
      .pipe(
        tap(response => {
          this.setSession(response);
          this._currentUser.set(response.user);
          this._isAuthenticated.set(true);
          this._isLoading.set(false);
        }),
        catchError(error => {
          this._isLoading.set(false);
          console.error('Signup error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.clearSession();
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, request)
      .pipe(
        catchError(error => {
          console.error('Forgot password error:', error);
          return throwError(() => error);
        })
      );
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, request)
      .pipe(
        catchError(error => {
          console.error('Reset password error:', error);
          return throwError(() => error);
        })
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.setSession(response);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  getCurrentUser(): User | null {
    return this._currentUser();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('refresh_token', authResult.refreshToken);
    localStorage.setItem('user', JSON.stringify(authResult.user));
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }
}
