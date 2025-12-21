import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private _user = signal<User | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isUserLoaded = computed(() => this._user() !== null);

  async loadUser(forceRefresh: boolean = false): Promise<void> {
    if (this._loading() && !forceRefresh) {
      return;
    }

    if (this._user() !== null && !forceRefresh) {
      return;
    }

    try {
      this._loading.set(true);
      this._error.set(null);
      
      const user = await firstValueFrom(
        this.http.get<User>(`${this.apiUrl}/users`, {
          withCredentials: true
        })
      );
      
      this._user.set(user);
    } catch (error: any) {
      if (error.status === 401 || error.status === 403) {
        this._user.set(null);
        this._error.set(null);
        return;
      }
      console.error('Failed to load user:', error);
      this._error.set(error.error?.message || 'Failed to load user data');
      this._user.set(null);
    } finally {
      this._loading.set(false);
    }
  }

  setUser(user: User | null): void {
    this._user.set(user);
    this._error.set(null);
  }

  clearUser(): void {
    this._user.set(null);
    this._error.set(null);
    this._loading.set(false);
  }

  async refreshUser(): Promise<void> {
    await this.loadUser(true);
  }
}

