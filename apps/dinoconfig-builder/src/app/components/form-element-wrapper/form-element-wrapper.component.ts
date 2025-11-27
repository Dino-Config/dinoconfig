import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridFieldConfig } from '../../models/config.models';

@Component({
  selector: 'dc-form-element-wrapper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-element-wrapper.component.html',
  styleUrl: './form-element-wrapper.component.scss'
})
export class FormElementWrapperComponent {
  @Input() field!: GridFieldConfig;
  @Input() value: any;
  @Input() isEditable: boolean = true;
  @Output() valueChange = new EventEmitter<any>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onValueChange(newValue: any): void {
    this.valueChange.emit(newValue);
  }

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }

  get parsedOptions(): string[] {
    if (!this.field.options) return [];
    return this.field.options.split(',').map(o => o.trim()).filter(Boolean);
  }
}

