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
    return this.http.get<Brand[]>(`${this.apiUrl}/brands`, {
      withCredentials: true
    });
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
    return this.http.post<Brand>(`${this.apiUrl}/brands`, brandData, {
      withCredentials: true
    });
  }
}

