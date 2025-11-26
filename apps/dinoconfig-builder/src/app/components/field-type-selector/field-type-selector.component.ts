import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType } from '../../models/config.models';

interface FieldTypeOption {
  value: FieldType;
  label: string;
  icon: string;
  description: string;
  category: 'text' | 'number' | 'choice' | 'date' | 'other';
}

@Component({
  selector: 'dc-field-type-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-type-selector.component.html',
  styleUrl: './field-type-selector.component.scss'
})
export class FieldTypeSelectorComponent {
  @Input() value!: FieldType;
  @Output() valueChange = new EventEmitter<FieldType>();

  isOpen = signal(false);
  selectedCategory = signal<string>('text');

  fieldTypeOptions: FieldTypeOption[] = [
    { value: 'text', label: 'Text', icon: '📝', description: 'Single line text input', category: 'text' },
    { value: 'textarea', label: 'Text Area', icon: '📄', description: 'Multi-line text input', category: 'text' },
    { value: 'email', label: 'Email', icon: '📧', description: 'Email address input', category: 'text' },
    { value: 'password', label: 'Password', icon: '🔒', description: 'Password input field', category: 'text' },
    { value: 'url', label: 'URL', icon: '🔗', description: 'Web address input', category: 'text' },
    { value: 'tel', label: 'Phone', icon: '📞', description: 'Phone number input', category: 'text' },
    { value: 'search', label: 'Search', icon: '🔍', description: 'Search input field', category: 'text' },
    { value: 'number', label: 'Number', icon: '🔢', description: 'Numeric value input', category: 'number' },
    { value: 'range', label: 'Range', icon: '🎚️', description: 'Slider for number range', category: 'number' },
    { value: 'checkbox', label: 'Checkbox', icon: '☑️', description: 'True/false toggle', category: 'choice' },
    { value: 'select', label: 'Select', icon: '📋', description: 'Dropdown selection', category: 'choice' },
    { value: 'radio', label: 'Radio', icon: '🔘', description: 'Radio button group', category: 'choice' },
    { value: 'time', label: 'Time', icon: '🕐', description: 'Time picker', category: 'date' },
    { value: 'datetime-local', label: 'Date & Time', icon: '📅', description: 'Date and time picker', category: 'date' },
    { value: 'month', label: 'Month', icon: '📆', description: 'Month picker', category: 'date' },
    { value: 'week', label: 'Week', icon: '📊', description: 'Week picker', category: 'date' },
    { value: 'date', label: 'Date', icon: '📅', description: 'Date picker', category: 'date' },
  ];

  categories = [
    { id: 'text', label: 'Text Inputs', icon: '📝' },
    { id: 'number', label: 'Numbers', icon: '🔢' },
    { id: 'choice', label: 'Choices', icon: '☑️' },
    { id: 'date', label: 'Date & Time', icon: '📅' },
  ];

  get selectedOption(): FieldTypeOption | undefined {
    return this.fieldTypeOptions.find(opt => opt.value === this.value);
  }

  get filteredOptions(): FieldTypeOption[] {
    return this.fieldTypeOptions.filter(opt => opt.category === this.selectedCategory());
  }

  toggleOpen(): void {
    this.isOpen.set(!this.isOpen());
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory.set(categoryId);
  }

  selectType(type: FieldType): void {
    this.valueChange.emit(type);
    this.isOpen.set(false);
  }
}

