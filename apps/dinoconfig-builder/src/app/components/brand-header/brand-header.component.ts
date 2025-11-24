import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Brand } from '../../models/user.models';

@Component({
  selector: 'dc-brand-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './brand-header.component.html',
  styleUrl: './brand-header.component.scss'
})
export class BrandHeaderComponent {
  private router = inject(Router);

  brand = input<Brand | null>(null);

  goBack(): void {
    this.router.navigate(['/brands']);
  }
}

