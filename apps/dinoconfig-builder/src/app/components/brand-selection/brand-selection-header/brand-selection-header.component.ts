import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dc-brand-selection-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-selection-header.component.html',
  styleUrl: './brand-selection-header.component.scss'
})
export class BrandSelectionHeaderComponent {
  hasBrands = input<boolean>(false);
  
  createBrand = output<void>();
}

