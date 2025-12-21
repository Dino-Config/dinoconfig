import { Injectable, computed, inject } from '@angular/core';
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

  readonly isAuthenticated = computed(() => this.userState.user() !== null);

  async validate(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.get(`${this.apiUrl}/auth/validate`, {
          withCredentials: true
        })
      );
      return true;
    } catch (error: any) {
      if (error.status === 401 || error.status === 403) {
        this.userState.clearUser();
      }
      return false;
    }
  }
}

