import { Component, input, output } from '@angular/core';

import { Brand } from '../../../models/user.models';

@Component({
  selector: 'dc-brand-card',
  standalone: true,
  imports: [],
  templateUrl: './brand-card.component.html',
  styleUrl: './brand-card.component.scss'
})
export class BrandCardComponent {
  brand = input.required<Brand>();
  
  selected = output<number>();
}

