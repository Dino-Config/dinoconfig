import React from 'react';
import { BaseFormElementProps, FormElementWrapper } from './BaseFormElement';

interface NumberInputElementProps extends BaseFormElementProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function NumberInputElement({ 
  config, 
  value, 
  onChange, 
  onEdit, 
  onDelete,
  isEditable = true 
}: NumberInputElementProps) {
  return (
    <FormElementWrapper config={config} onEdit={onEdit} onDelete={onDelete} isEditable={isEditable}>
      <input
        type="number"
        className="form-control"
        value={value !== undefined ? value : ''}
        onChange={(e) => onChange?.(e.target.valueAsNumber)}
        placeholder={`Enter ${config.label || config.name}`}
        required={config.required}
        min={config.min}
        max={config.max}
      />
    </FormElementWrapper>
  );
}

