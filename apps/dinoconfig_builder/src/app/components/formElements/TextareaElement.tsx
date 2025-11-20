import React from 'react';
import { BaseFormElementProps, FormElementWrapper } from './BaseFormElement';

interface TextareaElementProps extends BaseFormElementProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TextareaElement({ 
  config, 
  value, 
  onChange, 
  onEdit, 
  onDelete,
  isEditable = true 
}: TextareaElementProps) {
  return (
    <FormElementWrapper config={config} onEdit={onEdit} onDelete={onDelete} isEditable={isEditable}>
      <textarea
        className="form-control"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={`Enter ${config.label || config.name}`}
        required={config.required}
        maxLength={config.maxLength}
        rows={4}
      />
    </FormElementWrapper>
  );
}

