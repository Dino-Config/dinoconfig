import { Injectable } from '@angular/core';
import { FieldType, FieldConfig } from '../models/config.models';

@Injectable({
  providedIn: 'root'
})
export class FieldUtilsService {
  private readonly TEXT_TYPES: FieldType[] = [
    'text', 'textarea', 'email', 'password', 'url', 'tel', 'search',
    'time', 'datetime-local', 'month', 'week', 'date'
  ];

  private readonly NUMBER_TYPES: FieldType[] = ['number', 'range'];
  private readonly CHOICE_TYPES: FieldType[] = ['select', 'radio'];

  isTextType(type: FieldType): boolean {
    return this.TEXT_TYPES.includes(type);
  }

  isNumberType(type: FieldType): boolean {
    return this.NUMBER_TYPES.includes(type);
  }

  isChoiceType(type: FieldType): boolean {
    return this.CHOICE_TYPES.includes(type);
  }

  getDefaultValue(type: FieldType, options?: string): any {
    if (type === 'checkbox') return false;
    if (this.isNumberType(type)) return 0;
    if (this.isChoiceType(type) && options) {
      const parsed = this.parseOptions(options);
      return parsed[0] || '';
    }
    return '';
  }

  parseOptions(options: string): string[] {
    return options.split(',').map(o => o.trim()).filter(Boolean);
  }

  getDefaultSizes(type: FieldType): { w: number; h: number } {
    switch (type) {
      case 'textarea':
        return { w: 4, h: 2 };
      case 'checkbox':
      case 'radio':
        return { w: 2, h: 1 };
      case 'select':
        return { w: 5, h: 1 };
      default:
        return { w: 4, h: 1 };
    }
  }

  validateFieldConfig(field: FieldConfig): boolean {
    return !!(field.name?.trim());
  }

  createFieldId(): string {
    return `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  mapToFieldConfig(gridField: any): FieldConfig {
    return {
      name: gridField.name || '',
      type: gridField.type || 'text',
      label: gridField.label,
      options: gridField.options,
      required: gridField.required || false,
      min: gridField.min,
      max: gridField.max,
      maxLength: gridField.maxLength,
      pattern: gridField.pattern,
    };
  }
}

