import React from 'react';
import { BaseFormElementProps, FormElementWrapper } from './BaseFormElement';

interface SelectElementProps extends BaseFormElementProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function SelectElement({ 
  config, 
  value, 
  onChange, 
  onEdit, 
  onDelete,
  isEditable = true 
}: SelectElementProps) {
  const options = config.options ? config.options.split(',').map(o => o.trim()).filter(Boolean) : [];

  return (
    <FormElementWrapper config={config} onEdit={onEdit} onDelete={onDelete} isEditable={isEditable}>
      <select
        className="form-control form-select"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        required={config.required}
      >
        <option value="">Select an option</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FormElementWrapper>
  );
}

