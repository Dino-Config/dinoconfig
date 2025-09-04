import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  name?: string;
  nickname?: string;
}

interface AuthResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
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

  login(email: string, password: string): Observable<AuthResponse> {
    this._isLoading.set(true);
  
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`,
       { email, password },
       { withCredentials: true }).pipe(
      tap(response => {
        this.setSession(response);
        this._isAuthenticated.set(true);
        this._isLoading.set(false);
        this.checkAuthStatus();
      }),

      catchError(error => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
  }

  
  signup(userData: SignupRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
  
    return this.http.post(`${environment.apiUrl}/auth/signup`, userData).pipe(
      switchMap(() => {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
          email: userData.email,
          password: userData.password,
        });
      }),
      tap(loginResponse => {
        this.setSession(loginResponse);
        this._isAuthenticated.set(true);
        this._isLoading.set(false);
        this.checkAuthStatus();
      }),
      catchError(error => {
        this._isLoading.set(false);
        console.error('Signup error:', error);
        return throwError(() => error);
      })
    );
  }

  verifyEmail(userId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/send-verification`, { userId })
      .pipe(
        catchError(error => {
          console.error('Email verification error:', error);
          return throwError(() => error);
        })
      );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, request)
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

  getUserNickname(): string | null {
    const token = localStorage.getItem('id_token');
    if (!token || token === 'undefined') return null;
  
    const userPayload = this.decodeJwt(token);
    return userPayload.nickname || null;
  }

  getUser(): User | null {
    const token = localStorage.getItem('id_token');
    if (!token || token === 'undefined') return null;
  
    const payload = this.decodeJwt(token);
  
    const user: User = {
      id: payload.sub || '',       
      email: payload.email || '',
      name: payload.given_name || undefined,
      nickname: payload.nickname || undefined,
    };
  
    return user;
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

  private decodeJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('access_token', authResult.access_token);
    localStorage.setItem('id_token', authResult.id_token);
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}
