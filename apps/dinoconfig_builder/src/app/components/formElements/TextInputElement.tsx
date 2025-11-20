import React from 'react';
import { BaseFormElementProps, FormElementWrapper } from './BaseFormElement';

interface TextInputElementProps extends BaseFormElementProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TextInputElement({ 
  config, 
  value, 
  onChange, 
  onEdit, 
  onDelete,
  isEditable = true 
}: TextInputElementProps) {
  const inputType = config.type === 'text' ? 'text' :
                   config.type === 'email' ? 'email' :
                   config.type === 'password' ? 'password' :
                   config.type === 'url' ? 'url' :
                   config.type === 'tel' ? 'tel' :
                   config.type === 'search' ? 'search' :
                   config.type === 'time' ? 'time' :
                   config.type === 'datetime-local' ? 'datetime-local' :
                   config.type === 'month' ? 'month' :
                   config.type === 'week' ? 'week' :
                   'text';

  return (
    <FormElementWrapper config={config} onEdit={onEdit} onDelete={onDelete} isEditable={isEditable}>
      <input
        type={inputType}
        className="form-control"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={`Enter ${config.label || config.name}`}
        required={config.required}
        maxLength={config.maxLength}
        pattern={config.pattern}
      />
    </FormElementWrapper>
  );
}

