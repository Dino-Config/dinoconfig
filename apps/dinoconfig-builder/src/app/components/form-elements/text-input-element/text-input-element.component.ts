import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { GridFieldConfig } from '../../../models/config.models';
import { BaseFormElementComponent } from '../base-form-element/base-form-element.component';

@Component({
  selector: 'dc-text-input-element',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, FormsModule, BaseFormElementComponent],
  templateUrl: './text-input-element.component.html',
  styleUrl: './text-input-element.component.scss'
})
export class TextInputElementComponent {
  config = input.required<GridFieldConfig>();
  value = input<any>();
  isEditable = input<boolean>(true);
  valueChange = output<any>();
  edit = output<void>();
  delete = output<void>();

  inputType = computed(() => {
    const typeMap: Record<string, string> = {
      'text': 'text',
      'email': 'email',
      'password': 'password',
      'url': 'url',
      'tel': 'tel',
      'search': 'search',
      'time': 'time',
      'datetime-local': 'datetime-local',
      'month': 'month',
      'week': 'week'
    };
    return typeMap[this.config().type] || 'text';
  });

  onValueChange(newValue: any): void {
    this.valueChange.emit(newValue);
  }
}

