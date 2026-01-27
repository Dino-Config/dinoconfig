import { Component, input, output, computed } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { GridFieldConfig } from '../../../models/config.models';
import { BaseFormElementComponent } from '../base-form-element/base-form-element.component';

@Component({
  selector: 'dc-time-picker-element',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
    MatIconModule,
    FormsModule,
    BaseFormElementComponent
],
  templateUrl: './time-picker-element.component.html',
  styleUrl: './time-picker-element.component.scss'
})
export class TimePickerElementComponent {
  config = input.required<GridFieldConfig>();
  value = input<any>();
  isEditable = input<boolean>(true);
  valueChange = output<any>();
  edit = output<void>();
  delete = output<void>();
}
