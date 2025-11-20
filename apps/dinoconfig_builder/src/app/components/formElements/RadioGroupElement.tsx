import React from 'react';
import { BaseFormElementProps, FormElementWrapper } from './BaseFormElement';

interface RadioGroupElementProps extends BaseFormElementProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function RadioGroupElement({ 
  config, 
  value, 
  onChange, 
  onEdit, 
  onDelete,
  isEditable = true 
}: RadioGroupElementProps) {
  const options = config.options ? config.options.split(',').map(o => o.trim()).filter(Boolean) : [];

  return (
    <FormElementWrapper config={config} onEdit={onEdit} onDelete={onDelete} isEditable={isEditable}>
      <div className="radio-group">
        {options.map((option, index) => (
          <label key={index} className="radio-label">
            <input
              type="radio"
              name={config.name}
              value={option}
              checked={value === option}
              onChange={(e) => onChange?.(e.target.value)}
              required={config.required}
              className="form-radio"
            />
            <span className="radio-text">{option}</span>
          </label>
        ))}
      </div>
    </FormElementWrapper>
  );
}

