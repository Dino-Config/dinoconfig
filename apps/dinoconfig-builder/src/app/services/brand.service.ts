import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Brand } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getBrands(): Observable<Brand[] | { brands: Brand[] }> {
    return this.http.get<Brand[] | { brands: Brand[] }>(`${this.apiUrl}/brands`, {
      withCredentials: true
    });
  }
}

