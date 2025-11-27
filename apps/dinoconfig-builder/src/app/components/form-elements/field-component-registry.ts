import { Type } from '@angular/core';
import { FieldType } from '../../models/config.models';
import { TextInputElementComponent } from './text-input-element/text-input-element.component';
import { NumberInputElementComponent } from './number-input-element/number-input-element.component';
import { TextareaElementComponent } from './textarea-element/textarea-element.component';
import { CheckboxElementComponent } from './checkbox-element/checkbox-element.component';
import { RadioGroupElementComponent } from './radio-group-element/radio-group-element.component';
import { SelectElementComponent } from './select-element/select-element.component';
import { RangeElementComponent } from './range-element/range-element.component';
import { DatePickerElementComponent } from './date-picker-element/date-picker-element.component';

export interface FieldComponentMap {
  component: Type<any>;
  selector: string;
}

export const FIELD_COMPONENT_REGISTRY: Record<string, FieldComponentMap> = {
  text: { component: TextInputElementComponent, selector: 'dc-text-input-element' },
  email: { component: TextInputElementComponent, selector: 'dc-text-input-element' },
  password: { component: TextInputElementComponent, selector: 'dc-text-input-element' },
  url: { component: TextInputElementComponent, selector: 'dc-text-input-element' },
  tel: { component: TextInputElementComponent, selector: 'dc-text-input-element' },
  search: { component: TextInputElementComponent, selector: 'dc-text-input-element' },
  time: { component: TextInputElementComponent, selector: 'dc-text-input-element' },
  'datetime-local': { component: TextInputElementComponent, selector: 'dc-text-input-element' },
  month: { component: TextInputElementComponent, selector: 'dc-text-input-element' },
  week: { component: TextInputElementComponent, selector: 'dc-text-input-element' },
  number: { component: NumberInputElementComponent, selector: 'dc-number-input-element' },
  textarea: { component: TextareaElementComponent, selector: 'dc-textarea-element' },
  checkbox: { component: CheckboxElementComponent, selector: 'dc-checkbox-element' },
  radio: { component: RadioGroupElementComponent, selector: 'dc-radio-group-element' },
  select: { component: SelectElementComponent, selector: 'dc-select-element' },
  range: { component: RangeElementComponent, selector: 'dc-range-element' },
  date: { component: DatePickerElementComponent, selector: 'dc-date-picker-element' },
};

export function getFieldComponentType(fieldType: FieldType): string {
  const textTypes: FieldType[] = ['text', 'email', 'password', 'url', 'tel', 'search', 'time', 'datetime-local', 'month', 'week'];
  if (textTypes.includes(fieldType)) {
    return 'text';
  }
  return fieldType;
}

export function getFieldComponentSelector(fieldType: FieldType): string {
  const componentType = getFieldComponentType(fieldType);
  return FIELD_COMPONENT_REGISTRY[componentType]?.selector || 'dc-text-input-element';
}

