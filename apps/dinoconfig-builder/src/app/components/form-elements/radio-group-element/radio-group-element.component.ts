import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { GridFieldConfig } from '../../../models/config.models';
import { BaseFormElementComponent } from '../base-form-element/base-form-element.component';

@Component({
  selector: 'dc-radio-group-element',
  standalone: true,
  imports: [CommonModule, MatRadioModule, FormsModule, BaseFormElementComponent],
  templateUrl: './radio-group-element.component.html',
  styleUrl: './radio-group-element.component.scss'
})
export class RadioGroupElementComponent {
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

