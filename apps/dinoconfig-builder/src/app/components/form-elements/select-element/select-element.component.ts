import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { GridFieldConfig } from '../../../models/config.models';
import { BaseFormElementComponent } from '../base-form-element/base-form-element.component';

@Component({
  selector: 'dc-select-element',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, FormsModule, BaseFormElementComponent],
  templateUrl: './select-element.component.html',
  styleUrl: './select-element.component.scss'
})
export class SelectElementComponent {
  config = input.required<GridFieldConfig>();
  value = input<any>();
  isEditable = input<boolean>(true);
  valueChange = output<any>();
  edit = output<void>();
  delete = output<void>();

  options = computed(() => {
    const opts = this.config().options;
    return opts
      ? opts.split(',').map(o => o.trim()).filter(Boolean)
      : [];
  });

  onValueChange(newValue: string): void {
    this.valueChange.emit(newValue);
  }
}

