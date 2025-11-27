import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { BrandService } from '../../services/brand.service';
import { Brand } from '../../models/user.models';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { BrandAddDialogComponent } from '../brand-add/brand-add-dialog.component';
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
  private dialog = inject(MatDialog);

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
        return of([]);
      })
    ).subscribe(data => {
      this.brands.set(data);
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
    const dialogRef = this.dialog.open(BrandAddDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'brand-add-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.brands.set([...this.brands(), result]);
      }
    });
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }
}

