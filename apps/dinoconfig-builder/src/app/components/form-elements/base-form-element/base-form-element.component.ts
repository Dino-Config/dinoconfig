import { Component, input, output } from '@angular/core';

import { GridFieldConfig } from '../../../models/config.models';

@Component({
  selector: 'dc-base-form-element',
  standalone: true,
  imports: [],
  templateUrl: './base-form-element.component.html',
  styleUrl: './base-form-element.component.scss'
})
export class BaseFormElementComponent {
  config = input.required<GridFieldConfig>();
  isEditable = input<boolean>(true);
  edit = output<void>();
  delete = output<void>();

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }
}

