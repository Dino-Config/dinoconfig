import React from 'react';
import { FieldConfig } from '../../types';
import '../FormElements.scss';

export interface BaseFormElementProps {
  config: FieldConfig;
  value?: any;
  onChange?: (value: any) => void;
  onConfigChange?: (config: FieldConfig) => void;
  isEditable?: boolean;
}

export interface FormElementWrapperProps {
  config: FieldConfig;
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
}

export function FormElementWrapper({ config, children, onEdit, onDelete, isEditable = true }: FormElementWrapperProps) {
  return (
    <div className="form-element-wrapper">
        {config.label && (
          <label className="form-element-label">
            {config.label}
            {config.required && <span className="required-indicator">*</span>}
          </label>
        )}
        {children}
      {isEditable && (
        <div className="form-element-actions">
          <button
            type="button"
            className="action-btn edit-btn"
            onClick={onEdit}
            title="Edit field"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M6.417 2.333H2.333A1.167 1.167 0 001.167 3.5v8.167a1.167 1.167 0 001.166 1.166h8.167a1.167 1.167 0 001.167-1.166V7.583M10.792 1.458a1.237 1.237 0 011.75 1.75l-5.834 5.834H4.667V7l6.125-5.542z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="action-btn delete-btn"
            onClick={onDelete}
            title="Delete field"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1.75 3.5h10.5M11.083 3.5v8.167a1.167 1.167 0 01-1.166 1.166H4.083a1.167 1.167 0 01-1.166-1.166V3.5m1.75 0V2.333a1.167 1.167 0 011.166-1.166h2.334a1.167 1.167 0 011.166 1.166V3.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

