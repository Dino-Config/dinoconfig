import React, { useState, ChangeEvent } from 'react';
import { Form } from '@rjsf/mui';
import validator from "@rjsf/validator-ajv8";
import { JSONSchema7 } from "json-schema";
import { IChangeEvent } from "@rjsf/core";
import { Config, FieldConfig, FieldType } from '../types';
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
}

const fieldTypes: FieldType[] = [
  "text", "password", "select", "checkbox", "radio", "number",
  "textarea", "email", "range", "search", "tel", "url", "time",
  "datetime", "datetime-local", "week", "month"
];

export default function ConfigBuilderPanel({
  selectedConfig,
  schema,
  uiSchema,
  formData,
  onSchemaChange,
  onUiSchemaChange,
  onFormDataChange,
  onSave,
  onExport
}: ConfigBuilderPanelProps) {
  const [field, setField] = useState<FieldConfig>({
    name: "",
    type: "text",
    label: "",
    options: "",
    required: false,
  });
  const [showValidations, setShowValidations] = useState(false);

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

    setField({ name: "", type: "text", label: "", options: "", required: false });
  };

  if (!selectedConfig) {
    return (
      <div className="config-builder-panel">
        <h3 className="section-title">Create or select a config</h3>
        <div className="builder-disabled">
          <p>Please create or select a configuration first to add fields.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="config-builder-panel">
      <h3 className="section-title">
        Editing: {selectedConfig.name}
      </h3>

      {/* Builder */}
      <div className="field-builder">
        <input 
          placeholder="Field name" 
          value={field.name} 
          onChange={handleFieldChange("name")} 
        />
        <input 
          placeholder="Label (optional)" 
          value={field.label} 
          onChange={handleFieldChange("label")} 
        />

        <select 
          value={field.type} 
          onChange={handleFieldChange("type")}
        >
          {fieldTypes.map(ft => (
            <option key={ft} value={ft}>{ft}</option>
          ))}
        </select>

        {(field.type === "select" || field.type === "radio") && (
          <input 
            placeholder="Options (comma separated)" 
            value={field.options} 
            onChange={handleFieldChange("options")} 
          />
        )}

        <label className="toggle">
          <input 
            type="checkbox" 
            checked={showValidations} 
            onChange={() => setShowValidations(s => !s)} 
          />
          Show validation settings
        </label>

        {showValidations && (
          <div className="validation">
            <label>
              <input
                type="checkbox"
                checked={!!field.required}
                onChange={e => setField({ ...field, required: e.target.checked })}
              /> Required
            </label>

            {["number", "range"].includes(field.type) && (
              <div className="number-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={field.min ?? ""}
                  onChange={e => setField({ ...field, min: e.target.value ? Number(e.target.value) : undefined })}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={field.max ?? ""}
                  onChange={e => setField({ ...field, max: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            )}

            {["text", "textarea", "email", "search", "url", "tel"].includes(field.type) && (
              <>
                <input
                  type="number"
                  placeholder="Max Length"
                  value={field.maxLength ?? ""}
                  onChange={e => setField({ ...field, maxLength: e.target.value ? Number(e.target.value) : undefined })}
                />
                <input
                  placeholder="Pattern (regex)"
                  value={field.pattern ?? ""}
                  onChange={e => setField({ ...field, pattern: e.target.value || undefined })}
                />
              </>
            )}
          </div>
        )}

        <div className="actions">
          <button 
            className="btn action-btn"
            onClick={addFieldToSchema}
          >
            Add field
          </button>
          <button
            className="btn muted"
            onClick={() => setField({ name: "", type: "text", label: "", options: "", required: false })}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Live preview sections */}
      <div className="preview-sections">
        {/* Form Preview */}
        <div className="preview-form">
          <h4>Live Preview</h4>
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
                className="btn submit-btn"
                type="submit"
              >
                Save & Submit
              </button>
              <button
                className="btn action-btn"
                onClick={onExport}
              >
                Export
              </button>
            </div>
          </Form>
        </div>

        {/* JSON Data Display */}
        <div className="preview-json">
          <h4>JSON Data</h4>
          <div className="json-display">
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </div>
          <div className="json-info">
            <small>This is the actual data structure of the configuration</small>
          </div>
        </div>
      </div>
    </div>
  );
}

