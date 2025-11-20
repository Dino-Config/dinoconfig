import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  auth0Id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  isActive: boolean;
  companyName?: string;
  createdAt: string;
  brands?: any[];
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
  firstName: string;
  lastName: string;
  company: string;
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
    // Don't check auth status on initialization - signin/signup are now in React app
    this._isLoading.set(false);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    this._isLoading.set(true);
  
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`,
       { email, password },
       { withCredentials: true }).pipe(
      tap((loginResponse) => {
        // Set authenticated state without fetching user data
        this._isAuthenticated.set(true);
        this._isLoading.set(false);
      }),
      catchError(error => {
        this._isLoading.set(false);
        // Handle specific case where user doesn't exist in database
        if (error.status === 404 && error.error?.message?.includes('User not found in database')) {
          const customError = new Error('Your account exists but is not properly set up in our system. Please contact support or try signing up again.');
          customError.name = 'UserNotFoundInDatabase';
          return throwError(() => customError);
        }
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this._currentUser.set(null);
          this._isAuthenticated.set(false);
        }),
        catchError(error => {
          console.error('Logout failed', error);
          return throwError(() => error);
        })
      )
      .subscribe();
  }
  
  signup(userData: SignupRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
  
    return this.http.post(`${environment.apiUrl}/auth/signup`, userData).pipe(
      switchMap(() => {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
          email: userData.email,
          password: userData.password,
        }, { withCredentials: true });
      }),
      tap((loginResponse) => {
        // Set authenticated state without fetching user data
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
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((refreshResponse) => {
          // Set authenticated state without fetching user data
          this._isAuthenticated.set(true);
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

  getUserNickname(): string | null {
    const user = this._currentUser();
    return user ? `${user.firstName} ${user.lastName}`.trim() : null;
  }

  getUser(): User | null {
    return this._currentUser();
  }
}
