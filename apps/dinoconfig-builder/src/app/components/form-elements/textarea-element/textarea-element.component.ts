import { Component, input, output } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { GridFieldConfig } from '../../../models/config.models';
import { BaseFormElementComponent } from '../base-form-element/base-form-element.component';

@Component({
  selector: 'dc-textarea-element',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, BaseFormElementComponent],
  templateUrl: './textarea-element.component.html',
  styleUrl: './textarea-element.component.scss'
})
export class TextareaElementComponent {
  config = input.required<GridFieldConfig>();
  value = input<any>();
  isEditable = input<boolean>(true);
  valueChange = output<any>();
  edit = output<void>();
  delete = output<void>();

  onValueChange(newValue: any): void {
    this.valueChange.emit(newValue);
  }
}

