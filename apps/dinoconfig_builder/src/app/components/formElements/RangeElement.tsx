import React from 'react';
import { BaseFormElementProps, FormElementWrapper } from './BaseFormElement';

interface RangeElementProps extends BaseFormElementProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function RangeElement({ 
  config, 
  value, 
  onChange, 
  onEdit, 
  onDelete,
  isEditable = true 
}: RangeElementProps) {
  return (
    <FormElementWrapper config={config} onEdit={onEdit} onDelete={onDelete} isEditable={isEditable}>
      <div className="range-wrapper">
        <input
          type="range"
          className="form-range"
          value={value !== undefined ? value : (config.min || 0)}
          onChange={(e) => onChange?.(e.target.valueAsNumber)}
          min={config.min}
          max={config.max}
          required={config.required}
        />
        <span className="range-value">{value !== undefined ? value : (config.min || 0)}</span>
      </div>
    </FormElementWrapper>
  );
}

