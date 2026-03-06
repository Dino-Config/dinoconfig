import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CloseAccountResponse {
  message: string;
  restoreToken?: string;
}

export interface RestoreAccountResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  closeAccount(password: string): Observable<CloseAccountResponse> {
    return this.http.post<CloseAccountResponse>(
      `${this.apiUrl}/account/close`,
      { password },
      { withCredentials: true }
    );
  }

  restoreAccount(restoreToken: string): Observable<RestoreAccountResponse> {
    return this.http.post<RestoreAccountResponse>(
      `${this.apiUrl}/account/restore`,
      { restoreToken },
      { withCredentials: true }
    );
  }
}
