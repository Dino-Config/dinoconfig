import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiKeyList, CreateApiKeyRequest, CreateApiKeyResponse } from '../models/api-key.models';

@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getApiKeys(): Observable<ApiKeyList> {
    return this.http.get<ApiKeyList>(`${this.apiUrl}/api-keys`, {
      withCredentials: true
    });
  }

  createApiKey(request: CreateApiKeyRequest): Observable<CreateApiKeyResponse> {
    return this.http.post<CreateApiKeyResponse>(
      `${this.apiUrl}/api-keys`,
      request,
      { withCredentials: true }
    );
  }

  revokeApiKey(id: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/api-keys/${id}/revoke`,
      {},
      { withCredentials: true }
    );
  }

  deleteApiKey(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/api-keys/${id}`,
      { withCredentials: true }
    );
  }
}

