import React, { ChangeEvent } from 'react';
import { FieldConfig, FieldType } from '../types';
import FieldTypeSelector from './FieldTypeSelector';

export type FieldFormMode = 'add' | 'edit';

interface FieldFormProps {
  mode: FieldFormMode;
  field: FieldConfig;
  setField: React.Dispatch<React.SetStateAction<FieldConfig>>;
  showValidations: boolean;
  setShowValidations: React.Dispatch<React.SetStateAction<boolean>>;
  onSave: () => Promise<void> | void;
  onCancel: () => void;
  isSaving: boolean;
}

const FieldFormView: React.FC<FieldFormProps> = ({
  mode,
  field,
  setField,
  showValidations,
  setShowValidations,
  onSave,
  onCancel,
  isSaving,
}) => {
  const handleFieldChange = (key: keyof FieldConfig) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value =
      event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value;
    setField(prev => ({
      ...prev,
      [key]: value as any,
    }));
  };

  const handleTypeChange = (type: FieldType) => {
    setField(prev => ({
      ...prev,
      type,
    }));
  };

  const handleSaveClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    await onSave();
  };

  const handleCancelClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onCancel();
  };

  const isChoiceField = field.type === 'select' || field.type === 'radio';
  const isNumberField = field.type === 'number' || field.type === 'range';
  const isTextLikeField = [
    'text',
    'textarea',
    'email',
    'search',
    'url',
    'tel',
    'time',
    'datetime',
    'datetime-local',
    'month',
    'week',
  ].includes(field.type);

  const primaryLabel = mode === 'edit' ? 'Save Field Changes' : 'Add Field to Schema';
  const secondaryLabel = mode === 'edit' ? 'Cancel Editing' : 'Clear Form';

  return (
    <div className="field-builder-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`${mode}-field-name`}>
            Field Name *
            <span className="label-hint">The unique identifier for this field</span>
          </label>
          <input
            id={`${mode}-field-name`}
            placeholder="e.g., username, apiKey, maxRetries"
            value={field.name}
            onChange={handleFieldChange('name')}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`${mode}-field-label`}>
            Display Label
            <span className="label-hint">Optional label shown to users</span>
          </label>
          <input
            id={`${mode}-field-label`}
            placeholder="e.g., Username, API Key, Max Retries"
            value={field.label}
            onChange={handleFieldChange('label')}
          />
        </div>
      </div>

      <FieldTypeSelector value={field.type} onChange={handleTypeChange} />

      {isChoiceField && (
        <div className="form-group options-group">
          <label htmlFor={`${mode}-field-options`}>
            Options *
            <span className="label-hint">Comma-separated list of choices</span>
          </label>
          <input
            id={`${mode}-field-options`}
            placeholder="e.g., Option 1, Option 2, Option 3"
            value={field.options}
            onChange={handleFieldChange('options')}
          />
        </div>
      )}

      <div className="validation-section">
        <button
          type="button"
          className="validation-toggle"
          onClick={() => setShowValidations(open => !open)}
        >
          <svg className={`chevron ${showValidations ? 'open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Advanced Validation Settings
          {showValidations ? ' (Hide)' : ' (Show)'}
        </button>

        {showValidations && (
          <div className="validation-fields">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={!!field.required}
                onChange={event =>
                  setField(prev => ({
                    ...prev,
                    required: event.target.checked,
                  }))
                }
              />
              <span>Required field</span>
            </label>

            {isNumberField && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`${mode}-field-min`}>Minimum Value</label>
                  <input
                    id={`${mode}-field-min`}
                    type="number"
                    placeholder="Min"
                    value={field.min ?? ''}
                    onChange={event =>
                      setField(prev => ({
                        ...prev,
                        min: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`${mode}-field-max`}>Maximum Value</label>
                  <input
                    id={`${mode}-field-max`}
                    type="number"
                    placeholder="Max"
                    value={field.max ?? ''}
                    onChange={event =>
                      setField(prev => ({
                        ...prev,
                        max: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {isTextLikeField && (
              <>
                <div className="form-group">
                  <label htmlFor={`${mode}-field-maxlength`}>Maximum Length</label>
                  <input
                    id={`${mode}-field-maxlength`}
                    type="number"
                    placeholder="Maximum character length"
                    value={field.maxLength ?? ''}
                    onChange={event =>
                      setField(prev => ({
                        ...prev,
                        maxLength: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`${mode}-field-pattern`}>Pattern (Regular Expression)</label>
                  <input
                    id={`${mode}-field-pattern`}
                    placeholder="e.g., ^[a-zA-Z0-9]*$"
                    value={field.pattern ?? ''}
                    onChange={event =>
                      setField(prev => ({
                        ...prev,
                        pattern: event.target.value || undefined,
                      }))
                    }
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          className="btn btn-primary"
          onClick={handleSaveClick}
          disabled={!field.name.trim() || isSaving}
        >
          {mode === 'edit' ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          {primaryLabel}
        </button>
        <button className="btn btn-ghost" onClick={handleCancelClick} disabled={isSaving}>
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
};

export default FieldFormView;

