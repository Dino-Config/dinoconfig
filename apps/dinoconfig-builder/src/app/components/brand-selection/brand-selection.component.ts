import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrandService } from '../../services/brand.service';
import { Brand } from '../../models/user.models';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'dc-brand-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, SpinnerComponent],
  templateUrl: './brand-selection.component.html',
  styleUrl: './brand-selection.component.scss'
})
export class BrandSelectionComponent implements OnInit {
  private router = inject(Router);
  private brandService = inject(BrandService);

  brands = signal<Brand[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.brandService.getBrands().pipe(
      catchError((err: any) => {
        this.error.set(err.error?.message || 'Failed to load brands');
        return of(null);
      })
    ).subscribe(data => {
      if (data) {
        // Handle both array response and object with brands
        if (Array.isArray(data)) {
          this.brands.set(data);
        } else if ('brands' in data && Array.isArray(data.brands)) {
          this.brands.set(data.brands);
        } else {
          this.brands.set([]);
        }
      }
      this.isLoading.set(false);
    });
  }

  handleBrandSelect(brandId: number): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastBrandId', String(brandId));
      }
    } catch (_) {}
    this.router.navigate(['/brands', brandId, 'builder']);
  }

  handleCreateNewBrand(): void {
    this.router.navigate(['/brands/add']);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }
}

