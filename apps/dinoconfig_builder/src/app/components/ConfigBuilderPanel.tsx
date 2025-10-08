import React, { useState, ChangeEvent } from 'react';
import { Form } from '@rjsf/mui';
import validator from "@rjsf/validator-ajv8";
import { JSONSchema7 } from "json-schema";
import { IChangeEvent } from "@rjsf/core";
import { Config, FieldConfig, FieldType } from '../types';
import FieldTypeSelector from './FieldTypeSelector';
import './ConfigBuilderPanel.scss';

interface ConfigBuilderPanelProps {
  selectedConfig: Config | null;
  schema: JSONSchema7;
  uiSchema: Record<string, any>;
  formData: Record<string, any>;
  onSchemaChange: (schema: JSONSchema7) => void;
  onUiSchemaChange: (uiSchema: Record<string, any>) => void;
  onFormDataChange: (formData: Record<string, any>) => void;
  onSave: () => void;
  onExport: () => void;
  onNotification?: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export default function ConfigBuilderPanel({
  selectedConfig,
  schema,
  uiSchema,
  formData,
  onSchemaChange,
  onUiSchemaChange,
  onFormDataChange,
  onSave,
  onExport,
  onNotification
}: ConfigBuilderPanelProps) {
  const [field, setField] = useState<FieldConfig>({
    name: "",
    type: "text",
    label: "",
    options: "",
    required: false,
  });
  const [showValidations, setShowValidations] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showJsonData, setShowJsonData] = useState(true);

  const handleFieldChange = (key: keyof FieldConfig) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setField({ ...field, [key]: value as any });
  };

  const getSchemaType = (t: FieldType): JSONSchema7["type"] => {
    if (["number", "range"].includes(t)) return "number";
    if (t === "checkbox") return "boolean";
    return "string";
  };

  const getWidget = (t: FieldType) => {
    const widgetMap: Record<FieldType, string | undefined> = {
      textarea: "textarea",
      password: "password",
      radio: "radio",
      range: "range",
      search: "search",
      email: "email",
      url: "uri",
      tel: "tel",
      time: "time",
      datetime: "datetime",
      "datetime-local": "datetime-local",
      week: "week",
      month: "month",
      text: undefined,
      select: undefined,
      checkbox: undefined,
      number: undefined,
    };
    return widgetMap[t];
  };

  const ensureUiEntry = (name: string, widget?: string) => {
    onUiSchemaChange({
      ...uiSchema,
      [name]: widget ? { "ui:widget": widget } : (uiSchema[name] ?? {})
    });
  };

  const addFieldToSchema = () => {
    if (!field.name?.trim()) {
      onNotification?.('warning', 'Please enter a field name');
      return;
    }

    const fName = field.name.trim();
    const baseType = getSchemaType(field.type);
    const newField: any = { type: baseType, title: field.label || fName };

    if (["select", "radio"].includes(field.type) && field.options) {
      newField.enum = field.options.split(",").map(o => o.trim()).filter(Boolean);
    }

    if (showValidations) {
      if (field.required) {
        onSchemaChange({
          ...schema,
          required: Array.from(new Set([...(schema.required as string[] || []), fName]))
        });
      }
      if (typeof field.min === "number") newField.minimum = field.min;
      if (typeof field.max === "number") newField.maximum = field.max;
      if (typeof field.maxLength === "number") newField.maxLength = field.maxLength;
      if (field.pattern) newField.pattern = field.pattern;
    }

    onSchemaChange({
      ...schema,
      properties: { ...(schema.properties || {}), [fName]: newField }
    });

    const widget = getWidget(field.type);
    ensureUiEntry(fName, widget);

    onNotification?.('success', `Field "${fName}" added successfully!`);
    setField({ name: "", type: "text", label: "", options: "", required: false });
    
    // Expand and scroll to Live Preview
    setShowPreview(true);
    setTimeout(() => {
      const previewSection = document.querySelector('.preview-sections');
      if (previewSection) {
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  if (!selectedConfig) {
    return (
      <div className="config-builder-panel">
        <div className="panel-header">
          <h3 className="section-title">Configuration Builder</h3>
          <p className="section-subtitle">Create or select a config to get started</p>
        </div>
        <div className="builder-disabled">
          <div className="empty-state">
            <img src="assets/dino-sad.svg" alt="No configuration selected" className="empty-icon-svg" />
            <h4>No Configuration Selected</h4>
            <p>Please create or select a configuration from the sidebar to start building your form fields.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="config-builder-panel">
      <div className="panel-header">
        <div className="header-content">
          <h3 className="section-title">{selectedConfig.name}</h3>
          <p className="section-subtitle">Add and configure form fields</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={onExport}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10M11.333 5.333L8 2m0 0L4.667 5.333M8 2v8" 
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Field Builder */}
      <div className="field-builder-card">
        <div className="card-header">
          {/* <div className="header-icon">➕</div> */}
          <div>
            <h4>Add New Field</h4>
            <p>Configure a new form field to add to your configuration</p>
          </div>
        </div>

        <div className="field-builder-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="field-name">
                Field Name *
                <span className="label-hint">The unique identifier for this field</span>
              </label>
              <input 
                id="field-name"
                placeholder="e.g., username, apiKey, maxRetries" 
                value={field.name} 
                onChange={handleFieldChange("name")} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="field-label">
                Display Label
                <span className="label-hint">Optional label shown to users</span>
              </label>
              <input 
                id="field-label"
                placeholder="e.g., Username, API Key, Max Retries" 
                value={field.label} 
                onChange={handleFieldChange("label")} 
              />
            </div>
          </div>

          <FieldTypeSelector 
            value={field.type} 
            onChange={(type) => setField({ ...field, type })}
          />

          {(field.type === "select" || field.type === "radio") && (
            <div className="form-group options-group">
              <label htmlFor="field-options">
                Options *
                <span className="label-hint">Comma-separated list of choices</span>
              </label>
              <input 
                id="field-options"
                placeholder="e.g., Option 1, Option 2, Option 3" 
                value={field.options} 
                onChange={handleFieldChange("options")} 
              />
            </div>
          )}

          <div className="validation-section">
            <button 
              type="button"
              className="validation-toggle"
              onClick={() => setShowValidations(s => !s)}
            >
              <svg className={`chevron ${showValidations ? 'open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    onChange={e => setField({ ...field, required: e.target.checked })}
                  />
                  <span>Required field</span>
                </label>

                {["number", "range"].includes(field.type) && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="field-min">Minimum Value</label>
                      <input
                        id="field-min"
                        type="number"
                        placeholder="Min"
                        value={field.min ?? ""}
                        onChange={e => setField({ ...field, min: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="field-max">Maximum Value</label>
                      <input
                        id="field-max"
                        type="number"
                        placeholder="Max"
                        value={field.max ?? ""}
                        onChange={e => setField({ ...field, max: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                  </div>
                )}

                {["text", "textarea", "email", "search", "url", "tel"].includes(field.type) && (
                  <>
                    <div className="form-group">
                      <label htmlFor="field-maxlength">Maximum Length</label>
                      <input
                        id="field-maxlength"
                        type="number"
                        placeholder="Maximum character length"
                        value={field.maxLength ?? ""}
                        onChange={e => setField({ ...field, maxLength: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="field-pattern">Pattern (Regular Expression)</label>
                      <input
                        id="field-pattern"
                        placeholder="e.g., ^[a-zA-Z0-9]*$"
                        value={field.pattern ?? ""}
                        onChange={e => setField({ ...field, pattern: e.target.value || undefined })}
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
              onClick={addFieldToSchema}
              disabled={!field.name.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Field to Schema
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setField({ name: "", type: "text", label: "", options: "", required: false })}
            >
              Clear Form
            </button>
          </div>
        </div>
      </div>

      {/* Live preview sections */}
      <div className="preview-sections">
        {/* Form Preview */}
        <div className="preview-card">
          <div className="preview-header" onClick={() => setShowPreview(!showPreview)}>
            <div className="preview-header-content">
              {/* <div className="preview-icon">👁️</div> */}
              <div>
                <h4>Live Preview</h4>
                <p>See how your configuration form will look to users</p>
              </div>
            </div>
            <button className="toggle-btn" type="button">
              <svg 
                className={`chevron ${showPreview ? 'open' : ''}`}
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none"
              >
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          {showPreview && (
            <div className="preview-content">
              <Form
                schema={schema}
                uiSchema={uiSchema}
                formData={formData}
                validator={validator}
                onSubmit={onSave}
                showErrorList='top'
                onChange={(e: IChangeEvent) => onFormDataChange(e.formData)}
              >
                <div className="save-config-actions">
                  <button
                    className="btn btn-success"
                    type="submit"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Save Configuration
                  </button>
                </div>
              </Form>
            </div>
          )}
        </div>

        {/* JSON Data Display */}
        <div className="preview-card">
          <div className="preview-header" onClick={() => setShowJsonData(!showJsonData)}>
            <div className="preview-header-content">
              {/* <div className="preview-icon">📊</div> */}
              <div>
                <h4>Configuration Data</h4>
                <p>JSON representation of the current form data</p>
              </div>
            </div>
            <button className="toggle-btn" type="button">
              <svg 
                className={`chevron ${showJsonData ? 'open' : ''}`}
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none"
              >
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          {showJsonData && (
            <div className="preview-content">
              <div className="json-display">
                <pre>{JSON.stringify(formData, null, 2)}</pre>
              </div>
              {Object.keys(formData).length === 0 && (
                <div className="json-empty">
                  <p>No data yet. Fill out the form above to see the JSON output.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

