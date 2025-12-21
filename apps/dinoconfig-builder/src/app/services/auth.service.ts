import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, SignupRequest, AuthResponse } from '../models/auth.models';
import { UserStateService } from './user-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private userState = inject(UserStateService);
  private readonly apiUrl = environment.apiUrl;

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap((response) => {
        if (response.user) {
          this.userState.setUser(response.user);
        }
      })
    );
  }

  signup(userData: SignupRequest): Observable<AuthResponse> {
    return this.http.post(`${this.apiUrl}/auth/signup`, userData).pipe(
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
      tap((response) => {
        if (response.user) {
          this.userState.setUser(response.user);
        }
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
        this.userState.clearUser();
      })
    );
  }

  sendVerificationEmail(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/send-verification`, { userId }, {
      withCredentials: true
    });
  }

  validate(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/validate`, {
      withCredentials: true
    });
  }
}

