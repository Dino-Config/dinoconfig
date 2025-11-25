import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, SignupRequest, AuthResponse } from '../models/auth.models';
import { AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private authState = inject(AuthStateService);
  private readonly apiUrl = environment.apiUrl;

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap(() => {
        // Trigger auth state refresh after successful login
        this.authState.refreshAuth(true);
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
      tap(() => {
        // Trigger auth state refresh after successful signup/login
        this.authState.refreshAuth(true);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    });
  }

  sendVerificationEmail(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/send-verification`, { userId }, {
      withCredentials: true
    });
  }
}

