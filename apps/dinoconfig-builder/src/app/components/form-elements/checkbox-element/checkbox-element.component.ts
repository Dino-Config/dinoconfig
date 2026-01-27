import { Component, input, output } from '@angular/core';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { GridFieldConfig } from '../../../models/config.models';
import { BaseFormElementComponent } from '../base-form-element/base-form-element.component';

@Component({
  selector: 'dc-checkbox-element',
  standalone: true,
  imports: [MatCheckboxModule, FormsModule, BaseFormElementComponent],
  templateUrl: './checkbox-element.component.html',
  styleUrl: './checkbox-element.component.scss'
})
export class CheckboxElementComponent {
  config = input.required<GridFieldConfig>();
  value = input<any>();
  isEditable = input<boolean>(true);
  valueChange = output<any>();
  edit = output<void>();
  delete = output<void>();

  onValueChange(checked: boolean): void {
    this.valueChange.emit(checked);
  }
}

