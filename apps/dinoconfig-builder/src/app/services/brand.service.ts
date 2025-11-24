import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Brand } from '../models/user.models';
import { CreateBrandRequest } from '../models/brand.models';

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

  createBrand(brandData: CreateBrandRequest): Observable<Brand> {
    return this.http.post<Brand>(`${this.apiUrl}/brands`, {
      name: brandData.name,
      description: brandData.description || undefined,
      logo: brandData.logo || undefined,
      website: brandData.website || undefined,
    }, {
      withCredentials: true
    });
  }
}

