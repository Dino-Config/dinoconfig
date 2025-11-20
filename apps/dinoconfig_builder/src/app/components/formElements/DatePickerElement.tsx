import React from 'react';
import { BaseFormElementProps, FormElementWrapper } from './BaseFormElement';

interface DatePickerElementProps extends BaseFormElementProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function DatePickerElement({ 
  config, 
  value, 
  onChange, 
  onEdit, 
  onDelete,
  isEditable = true 
}: DatePickerElementProps) {
  return (
    <FormElementWrapper config={config} onEdit={onEdit} onDelete={onDelete} isEditable={isEditable}>
      <input
        type="date"
        className="form-control"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={`Select ${config.label || config.name}`}
        required={config.required}
      />
    </FormElementWrapper>
  );
}

