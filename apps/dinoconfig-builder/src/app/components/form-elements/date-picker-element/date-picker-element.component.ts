import { Component, input, output, computed } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { GridFieldConfig } from '../../../models/config.models';
import { BaseFormElementComponent } from '../base-form-element/base-form-element.component';

@Component({
  selector: 'dc-date-picker-element',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    FormsModule,
    BaseFormElementComponent
],
  templateUrl: './date-picker-element.component.html',
  styleUrl: './date-picker-element.component.scss'
})
export class DatePickerElementComponent {
  config = input.required<GridFieldConfig>();
  value = input<any>();
  isEditable = input<boolean>(true);
  valueChange = output<any>();
  edit = output<void>();
  delete = output<void>();

  dateValue = computed(() => {
    const val = this.value();
    if (!val) return null;
    try {
      return new Date(val);
    } catch {
      return null;
    }
  });

  onValueChange(date: Date | null): void {
    if (date) {
      // Format as YYYY-MM-DD for date input compatibility
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      this.valueChange.emit(`${year}-${month}-${day}`);
    } else {
      this.valueChange.emit('');
    }
  }
}

