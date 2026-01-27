import { Component, input, output } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { GridFieldConfig } from '../../../models/config.models';
import { BaseFormElementComponent } from '../base-form-element/base-form-element.component';

@Component({
  selector: 'dc-number-input-element',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, BaseFormElementComponent],
  templateUrl: './number-input-element.component.html',
  styleUrl: './number-input-element.component.scss'
})
export class NumberInputElementComponent {
  config = input.required<GridFieldConfig>();
  value = input<any>();
  isEditable = input<boolean>(true);
  valueChange = output<any>();
  edit = output<void>();
  delete = output<void>();

  onValueChange(newValue: any): void {
    const numValue = newValue === '' ? undefined : Number(newValue);
    this.valueChange.emit(numValue);
  }
}

