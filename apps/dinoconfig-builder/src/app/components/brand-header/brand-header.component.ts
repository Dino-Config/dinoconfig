import { Component, input, inject, signal, OnInit, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrandService } from '../../services/brand.service';
import { AuthStateService } from '../../services/auth-state.service';
import { Brand } from '../../models/user.models';
import { BrandSwitcherDropdownComponent } from './brand-switcher-dropdown/brand-switcher-dropdown.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'dc-brand-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, BrandSwitcherDropdownComponent],
  templateUrl: './brand-header.component.html',
  styleUrl: './brand-header.component.scss'
})
export class BrandHeaderComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private brandService = inject(BrandService);
  private authState = inject(AuthStateService);

  brand = input<Brand | null>(null);
  isDropdownOpen = signal<boolean>(false);
  searchQuery = signal<string>('');
  brands = signal<Brand[]>([]);
  isLoading = signal<boolean>(false);

  constructor() {
    // Load brands when authenticated
    effect(() => {
      const isAuthenticated = this.authState.isAuthenticated();
      if (isAuthenticated && this.brands().length === 0 && !this.isLoading()) {
        this.loadBrands();
      }
    });
  }

  ngOnInit(): void {
    if (this.authState.isAuthenticated() && this.brands().length === 0) {
      this.loadBrands();
    }
  }

  loadBrands(): void {
    if (!this.authState.isAuthenticated() || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.brandService.getBrands().pipe(
      catchError(() => of([]))
    ).subscribe(brands => {
      this.brands.set(brands);
      this.isLoading.set(false);
    });
  }

  toggleDropdown(): void {
    const wasOpen = this.isDropdownOpen();
    this.isDropdownOpen.update(open => !open);
    
    // Load brands if opening and not loaded
    if (!wasOpen && this.brands().length === 0 && this.authState.isAuthenticated()) {
      this.loadBrands();
    }
    
    // Clear search when closing
    if (wasOpen) {
      this.searchQuery.set('');
    }
  }

  onBrandSelected(brand: Brand): void {
    const currentBrandId = this.brand()?.id;
    if (currentBrandId === brand.id) {
      this.isDropdownOpen.set(false);
      return;
    }
    
    // Store selected brand ID in localStorage
    try {
      localStorage.setItem('selectedBrandId', String(brand.id));
    } catch (e) {
      console.warn('Failed to save selectedBrandId to localStorage:', e);
    }
    
    this.isDropdownOpen.set(false);
    this.searchQuery.set('');
    this.router.navigate(['/brands', brand.id, 'builder']);
  }

  onSearchQueryChange(query: string): void {
    this.searchQuery.set(query);
  }

  goBack(): void {
    this.router.navigate(['/brands']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.brand-header-switcher')) {
      this.isDropdownOpen.set(false);
      this.searchQuery.set('');
    }
  }
}

