import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BrandService } from '../../services/brand.service';
import { AuthStateService } from '../../services/auth-state.service';
import { UserStateService } from '../../services/user-state.service';
import { Brand } from '../../models/user.models';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { BrandAddDialogComponent } from '../brand-add/brand-add-dialog.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'dc-brand-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './brand-selection.component.html',
  styleUrl: './brand-selection.component.scss'
})
export class BrandSelectionComponent implements OnInit {
  private router = inject(Router);
  private brandService = inject(BrandService);
  private dialog = inject(MatDialog);
  private authState = inject(AuthStateService);
  private userState = inject(UserStateService);

  brands = signal<Brand[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  private brandsLoaded = signal(false);
  private isLoadingBrands = signal(false);

  constructor() {
    // Watch for auth state changes and load brands when authenticated
    effect(() => {
      const isAuthenticated = this.authState.isAuthenticated();
      const isExplicitlyCleared = this.userState.isExplicitlyCleared();
      const alreadyLoaded = this.brandsLoaded();
      const currentlyLoading = this.isLoadingBrands();
      
      // Load brands if authenticated, not explicitly cleared, not already loaded, and not currently loading
      if (isAuthenticated && !isExplicitlyCleared && !alreadyLoaded && !currentlyLoading) {
        this.loadBrands();
      } else if (!isAuthenticated || isExplicitlyCleared) {
        // Reset if not authenticated
        this.brands.set([]);
        this.brandsLoaded.set(false);
        this.isLoadingBrands.set(false);
        this.isLoading.set(false);
      }
    });
  }

  ngOnInit(): void {
    // Only try to load if not already loading or loaded
    // The effect will handle loading when auth state is ready
    if (!this.authState.isAuthenticated() || this.userState.isExplicitlyCleared()) {
      this.isLoading.set(false);
    }
  }

  loadBrands(): void {
    // Double check authentication before making the call
    if (!this.authState.isAuthenticated() || this.userState.isExplicitlyCleared()) {
      this.isLoading.set(false);
      this.isLoadingBrands.set(false);
      return;
    }

    // Prevent duplicate calls - check both flags
    if (this.brandsLoaded() || this.isLoadingBrands()) {
      return;
    }

    // Set loading flag immediately to prevent concurrent calls
    this.isLoadingBrands.set(true);
    this.isLoading.set(true);
    this.error.set(null);

    this.brandService.getBrands().pipe(
      catchError((err: any) => {
        this.error.set(err.error?.message || 'Failed to load brands');
        this.isLoading.set(false);
        this.isLoadingBrands.set(false);
        return of([]);
      })
    ).subscribe(data => {
      this.brands.set(data);
      this.brandsLoaded.set(true);
      this.isLoadingBrands.set(false);
      this.isLoading.set(false);
    });
  }

  handleBrandSelect(brandId: number): void {
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
        // Mark as loaded since we just added a brand
        this.brandsLoaded.set(true);
      }
    });
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }
}

