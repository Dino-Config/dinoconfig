import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Brand } from '../../../models/user.models';

@Component({
  selector: 'dc-brand-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-card.component.html',
  styleUrl: './brand-card.component.scss'
})
export class BrandCardComponent {
  brand = input.required<Brand>();
  
  selected = output<number>();
}

