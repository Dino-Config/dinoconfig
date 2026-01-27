import { Component, signal, inject, OnInit, computed } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BrandService } from '../../services/brand.service';
import { Brand } from '../../models/user.models';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state/error-state.component';
import { BrandCardComponent } from './brand-card/brand-card.component';
import { BrandSelectionHeaderComponent } from './brand-selection-header/brand-selection-header.component';
import { BrandAddDialogComponent } from '../brand-add/brand-add-dialog.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'dc-brand-selection',
  standalone: true,
  imports: [
    RouterModule,
    SpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    BrandCardComponent,
    BrandSelectionHeaderComponent
],
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

  // Computed signals for template
  hasBrands = computed(() => this.brands().length > 0);
  showContent = computed(() => !this.isLoading() && !this.error());

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.brandService.getBrands().pipe(
      catchError((err: any) => {
        this.error.set(err.error?.message || 'Failed to load brands');
        this.isLoading.set(false);
        return of([]);
      })
    ).subscribe(data => {
      this.brands.set(data);
      this.isLoading.set(false);
    });
  }

  handleBrandSelect(brandId: number): void {
    // Store selected brand ID in localStorage
    try {
      localStorage.setItem('selectedBrandId', String(brandId));
    } catch (e) {
      console.warn('Failed to save selectedBrandId to localStorage:', e);
    }
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

}

