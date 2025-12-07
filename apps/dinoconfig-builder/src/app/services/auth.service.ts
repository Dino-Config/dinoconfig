import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, from, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, SignupRequest, AuthResponse } from '../models/auth.models';
import { AuthStateService } from './auth-state.service';
import { UserStateService } from './user-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private authState = inject(AuthStateService);
  private userState = inject(UserStateService);
  private readonly apiUrl = environment.apiUrl;

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      switchMap((response) => {
        // Store user data from login response if available
        if (response.user) {
          this.userState.setUser(response.user);
        }
        // Wait for auth state refresh to complete before proceeding
        return from(this.authState.refreshAuth(true)).pipe(
          switchMap(() => of(response))
        );
      })
    );
  }

  signup(userData: SignupRequest): Observable<AuthResponse> {
    // First signup, then login
    return this.http.post(`${this.apiUrl}/auth/signup`, userData).pipe(
      // After signup, login automatically using switchMap
      switchMap(() => {
        return this.http.post<AuthResponse>(
          `${this.apiUrl}/auth/login`,
          {
            email: userData.email,
            password: userData.password,
          },
          { withCredentials: true }
        );
      }),
      switchMap((response) => {
        // Store user data from login response if available
        if (response.user) {
          this.userState.setUser(response.user);
        }
        // Wait for auth state refresh to complete before proceeding
        return from(this.authState.refreshAuth(true)).pipe(
          switchMap(() => of(response))
        );
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        // Set logout state without making additional API calls
        this.authState.setLoggedOut();
      })
    );
  }

  sendVerificationEmail(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/send-verification`, { userId }, {
      withCredentials: true
    });
  }
}

