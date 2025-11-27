import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Brand } from '../models/user.models';
import { CreateBrandRequest } from '../models/brand.models';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[] | { brands: Brand[] }>(`${this.apiUrl}/brands`, {
      withCredentials: true
    }).pipe(
      map(data => {
        if (Array.isArray(data)) {
          return data;
        } else if ('brands' in data && Array.isArray(data.brands)) {
          return data.brands;
        } else {
          return [];
        }
      })
    );
  }

  getBrand(brandId: number): Observable<Brand> {
    return this.getBrands().pipe(
      map(brands => {
        const brand = brands.find(b => b.id === brandId);
        if (!brand) {
          throw new Error('Brand not found');
        }
        return brand;
      })
    );
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

