import { Component, input, output, signal, computed, OnInit, effect } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Brand } from '../../../models/user.models';

@Component({
  selector: 'dc-brand-switcher-dropdown',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  templateUrl: './brand-switcher-dropdown.component.html',
  styleUrl: './brand-switcher-dropdown.component.scss'
})
export class BrandSwitcherDropdownComponent implements OnInit {
  brands = input.required<Brand[]>();
  isLoading = input.required<boolean>();
  selectedBrandId = input<number | null>(null);
  searchQuery = input.required<string>();

  searchQueryChange = output<string>();
  brandSelected = output<Brand>();
  close = output<void>();

  searchQuerySignal = signal<string>('');

  filteredBrands = computed(() => {
    const query = this.searchQuerySignal().toLowerCase().trim();
    const brandsList = this.brands();
    if (!query) return brandsList;
    return brandsList.filter(b => 
      b.name.toLowerCase().includes(query) ||
      (b.description && b.description.toLowerCase().includes(query))
    );
  });

  constructor() {
    // Sync search query from input
    effect(() => {
      this.searchQuerySignal.set(this.searchQuery());
    });
  }

  ngOnInit(): void {
    // Initialize search query from input
    this.searchQuerySignal.set(this.searchQuery());
  }

  onSearchChange(value: string): void {
    this.searchQuerySignal.set(value);
    this.searchQueryChange.emit(value);
  }

  clearSearch(): void {
    this.searchQuerySignal.set('');
    this.searchQueryChange.emit('');
  }

  onBrandSelect(brand: Brand): void {
    this.brandSelected.emit(brand);
  }

  onClose(): void {
    this.close.emit();
  }
}

