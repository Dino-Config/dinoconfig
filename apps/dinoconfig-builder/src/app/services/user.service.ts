import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users`, {
      withCredentials: true
    });
  }
}

