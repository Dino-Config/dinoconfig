import React, { useState, useEffect, ChangeEvent } from 'react';
import { Form } from '@rjsf/mui';
import validator from "@rjsf/validator-ajv8";
import { JSONSchema7 } from "json-schema";
import { IChangeEvent } from "@rjsf/core";
import Grid from "@mui/material/Grid";
import { ObjectFieldTemplateProps, canExpand, descriptionId, getTemplate, getUiOptions, titleId } from "@rjsf/utils";
import { Config, FieldConfig, FieldType } from '../types';
import FieldTypeSelector from './FieldTypeSelector';
import './ConfigBuilderPanel.scss';
import { ConfigService } from '../services/configService';

const createEmptyFieldConfig = (): FieldConfig => ({
  name: "",
  type: "text",
  label: "",
  options: "",
  required: false,
  min: undefined,
  max: undefined,
  maxLength: undefined,
  pattern: undefined,
});

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
  brandId: number | null;
  onConfigUpdated: (config: Config, versions: Config[], previousConfigId: number) => void;
  onConfirm: (title: string, message: string) => Promise<boolean>;
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
  onNotification,
  brandId,
  onConfigUpdated,
  onConfirm
}: ConfigBuilderPanelProps) {
  const [field, setField] = useState<FieldConfig>(createEmptyFieldConfig());
  const [showValidations, setShowValidations] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showJsonData, setShowJsonData] = useState(true);
  const [editingFieldName, setEditingFieldName] = useState<string | null>(null);
  const [isSavingField, setIsSavingField] = useState(false);

  // Reset preview state when config changes
  useEffect(() => {
    setShowPreview(true);
    setShowJsonData(true);
  }, [selectedConfig?.id]);

  const handleFieldChange = (key: keyof FieldConfig) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setField({ ...field, [key]: value as any });
  };

  const getSchemaType = (t: FieldType): JSONSchema7["type"] => {
    if (["number", "range"].includes(t)) return "number";
    if (t === "checkbox") return "boolean";
    return "string";
  };

  // Returns valid RJSF widget name or undefined for default/widget-less fields
  // Only returns valid RJSF widgets: textarea, password, email, uri, radio, range
  const getWidget = (t: FieldType): string | undefined => {
    const widgetMap: Record<FieldType, string | undefined> = {
      // String fields with valid RJSF widgets
      text: undefined,          // default text input (no widget needed)
      textarea: "textarea",
      password: "password",
      email: "email",
      url: "uri",
      
      // Unsupported string types - will use ui:options.inputType
      tel: undefined,
      search: undefined,
      time: undefined,
      "datetime-local": undefined,
      month: undefined,
      week: undefined,
  
      // ENUM-based fields
      select: undefined,        // default select (no widget needed)
      radio: "radio",
  
      // Number fields
      number: undefined,       // default number input (no widget needed)
      range: "range",
  
      // Boolean fields
      checkbox: undefined,     // default checkbox (no widget needed)
    };
    return widgetMap[t];
  };

  // Returns true if the field type requires ui:options.inputType
  const requiresInputType = (t: FieldType): boolean => {
    const unsupportedTypes: FieldType[] = [
      "tel", "search", "time",  "datetime-local", "month", "week"
    ];
    return unsupportedTypes.includes(t);
  };

  const createUiEntry = (fieldType: FieldType, widget?: string) => {
    if (requiresInputType(fieldType)) {
      return {
        "ui:widget": "text",
        "ui:options": { inputType: fieldType }
      };
    }

    if (widget) {
      return {
        "ui:widget": widget
      };
    }

    return {};
  };

  const resetFieldBuilder = () => {
    setField(createEmptyFieldConfig());
    setEditingFieldName(null);
  };

  const scrollToPreview = () => {
    setShowPreview(true);
    setTimeout(() => {
      const previewSection = document.querySelector('.preview-sections');
      if (previewSection) {
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const determineFieldType = (name: string, property: any): FieldType => {
    const uiEntry = uiSchema?.[name] || {};

    if (property?.type === "boolean") {
      return "checkbox";
    }

    if (property?.type === "number") {
      return uiEntry["ui:widget"] === "range" ? "range" : "number";
    }

    if (Array.isArray(property?.enum)) {
      return uiEntry["ui:widget"] === "radio" ? "radio" : "select";
    }

    const inputType = uiEntry?.["ui:options"]?.inputType as FieldType | undefined;
    if (inputType && requiresInputType(inputType)) {
      return inputType;
    }

    switch (uiEntry["ui:widget"]) {
      case "textarea":
        return "textarea";
      case "password":
        return "password";
      case "email":
        return "email";
      case "uri":
        return "url";
      case "radio":
        return "radio";
      case "range":
        return "range";
      default:
        break;
    }

    if (property?.format === "email") return "email";
    if (property?.format === "uri") return "url";

    return "text";
  };

  const getDefaultValueForField = (fieldType: FieldType, options?: string) => {
    if (fieldType === "checkbox") {
      return false;
    }

    if (["number", "range"].includes(fieldType)) {
      return 0;
    }

    if (["radio", "select"].includes(fieldType) && options) {
      const parsedOptions = options.split(",").map(o => o.trim()).filter(Boolean);
      return parsedOptions[0] || "";
    }

    return "";
  };

  const saveFieldToSchema = async () => {
    if (!field.name?.trim()) {
      onNotification?.('warning', 'Please enter a field name');
      return;
    }

    const fName = field.name.trim();
    const previousName = editingFieldName;
    const previousValue = previousName ? formData[previousName] : formData[fName];

    if (editingFieldName) {
      if (!brandId || !selectedConfig) {
        onNotification?.('error', 'Select a configuration before editing fields.');
        return;
      }

      try {
        setIsSavingField(true);
        const response = await ConfigService.updateField(
          brandId,
          selectedConfig.id,
          editingFieldName,
          {
            name: fName,
            label: field.label?.trim() || undefined,
            type: field.type,
            options: field.options ? field.options : undefined,
            required: field.required,
            min: field.min,
            max: field.max,
            maxLength: field.maxLength,
            pattern: field.pattern,
          }
        );

        onConfigUpdated(response.config, response.versions, selectedConfig.id);
        onNotification?.('success', `Field "${fName}" updated successfully!`);
        resetFieldBuilder();
        scrollToPreview();
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update field. Please try again.';
        onNotification?.('error', message);
      } finally {
        setIsSavingField(false);
      }

      return;
    }

    const baseType = getSchemaType(field.type);
    const newField: any = { type: baseType, title: field.label || fName };

    if (["select", "radio"].includes(field.type) && field.options) {
      newField.enum = field.options.split(",").map(o => o.trim()).filter(Boolean);
    }

    if (typeof field.min === "number") newField.minimum = field.min;
    if (typeof field.max === "number") newField.maximum = field.max;
    if (typeof field.maxLength === "number") newField.maxLength = field.maxLength;
    if (field.pattern) newField.pattern = field.pattern;

    const updatedProperties = { ...(schema.properties || {}) };
    if (previousName && previousName !== fName) {
      delete updatedProperties[previousName];
    }
    updatedProperties[fName] = newField;

    const requiredSet = new Set<string>(Array.isArray(schema.required) ? schema.required as string[] : []);
    if (previousName && previousName !== fName) {
      requiredSet.delete(previousName);
    }
    if (field.required) {
      requiredSet.add(fName);
    } else {
      requiredSet.delete(fName);
    }

    const updatedSchema: JSONSchema7 = {
      ...schema,
      properties: updatedProperties,
      required: Array.from(requiredSet)
    };

    if (updatedSchema.required && updatedSchema.required.length === 0) {
      delete updatedSchema.required;
    }

    onSchemaChange(updatedSchema);

    const widget = getWidget(field.type);
    const uiEntry = createUiEntry(field.type, widget);
    const updatedUiSchema = { ...uiSchema };

    if (previousName && previousName !== fName) {
      delete updatedUiSchema[previousName];
    }

    // Remove empty UI entries to keep schema clean
    if (uiEntry && Object.keys(uiEntry).length > 0) {
      updatedUiSchema[fName] = uiEntry;
    } else {
      delete updatedUiSchema[fName];
    }
    onUiSchemaChange(updatedUiSchema);

    const defaultValue = getDefaultValueForField(field.type, field.options);
    const shouldResetValue = () => {
      if (previousValue === undefined) return true;
      switch (field.type) {
        case "checkbox":
          return typeof previousValue !== "boolean";
        case "number":
        case "range":
          return typeof previousValue !== "number";
        case "radio":
        case "select":
          return typeof previousValue !== "string" || (
            field.options
              ? !field.options.split(",").map(o => o.trim()).filter(Boolean).includes(previousValue)
              : false
          );
        default:
          return typeof previousValue !== "string";
      }
    };

    const updatedFormData = { ...formData };
    if (previousName && previousName !== fName) {
      delete updatedFormData[previousName];
    }

    if (editingFieldName) {
      updatedFormData[fName] = shouldResetValue() ? defaultValue : previousValue;
    } else if (!(fName in updatedFormData)) {
      updatedFormData[fName] = defaultValue;
    }

    onFormDataChange(updatedFormData);

    onNotification?.('success', `Field "${fName}" added successfully!`);
    resetFieldBuilder();
    scrollToPreview();
  };

  const handleEditField = (name: string) => {
    const properties = schema.properties as Record<string, any> | undefined;
    if (!properties || !properties[name]) return;

    const property = properties[name];
    const detectedType = determineFieldType(name, property);
    const isRequired = Array.isArray(schema.required) ? (schema.required as string[]).includes(name) : false;
    const optionsValue = Array.isArray(property.enum) ? property.enum.join(", ") : "";
    const hasValidations = isRequired ||
      typeof property.minimum === "number" ||
      typeof property.maximum === "number" ||
      typeof property.maxLength === "number" ||
      typeof property.pattern === "string";

    setField({
      name,
      type: detectedType,
      label: property.title || "",
      options: optionsValue,
      required: isRequired,
      min: typeof property.minimum === "number" ? property.minimum : undefined,
      max: typeof property.maximum === "number" ? property.maximum : undefined,
      maxLength: typeof property.maxLength === "number" ? property.maxLength : undefined,
      pattern: typeof property.pattern === "string" ? property.pattern : undefined,
    });

    setEditingFieldName(name);
    setShowValidations(hasValidations);
    setShowPreview(true);

    setTimeout(() => {
      const builderTop = document.querySelector('.field-builder-card');
      if (builderTop) {
        builderTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleDeleteField = async (name: string) => {
    if (!schema.properties || !(schema.properties as Record<string, any>)[name]) {
      return;
    }

    const confirmDelete = await onConfirm(
      "Delete Field",
      `Are you sure you want to delete the field "${name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    if (!brandId || !selectedConfig) {
      onNotification?.('error', 'Select a configuration before deleting fields.');
      return;
    }

    try {
      setIsSavingField(true);
      const response = await ConfigService.deleteField(brandId, selectedConfig.id, name);
      onConfigUpdated(response.config, response.versions, selectedConfig.id);
      if (editingFieldName === name) {
        resetFieldBuilder();
      }
      onNotification?.('success', `Field "${name}" deleted successfully.`);
      scrollToPreview();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete field. Please try again.';
      onNotification?.('error', message);
    } finally {
      setIsSavingField(false);
    }
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

  const handleSubmit = (event: IChangeEvent) => {
    onFormDataChange(event.formData);
    onSave();
  };

  const properties = (schema.properties ?? {}) as Record<string, any>;
  const fieldEntries = Object.entries(properties);
  const hasFields = fieldEntries.length > 0;
  const rootFieldNames = fieldEntries.map(([name]) => name);

  interface FieldActionContext {
    onEditField: (name: string) => void;
    onDeleteField: (name: string) => void;
    rootFieldNames: string[];
    editingFieldName: string | null;
    isSavingField: boolean;
  }

  const FieldActionsObjectTemplate = ({
    description,
    title,
    properties: templateProperties,
    required,
    disabled,
    readonly,
    uiSchema,
    idSchema,
    schema: templateSchema,
    formData,
    onAddClick,
    registry,
  }: ObjectFieldTemplateProps<any>) => {
    const uiOptions = getUiOptions(uiSchema);
    const TitleFieldTemplate = getTemplate<'TitleFieldTemplate', any, any>('TitleFieldTemplate', registry, uiOptions);
    const DescriptionFieldTemplate = getTemplate<'DescriptionFieldTemplate', any, any>(
      'DescriptionFieldTemplate',
      registry,
      uiOptions
    );
    const {
      ButtonTemplates: { AddButton },
    } = registry.templates;
    const formContext = registry.formContext as FieldActionContext | undefined;
    const isRootObject = idSchema?.$id === 'root';

    return (
      <>
        {title && (
          <TitleFieldTemplate
            id={titleId(idSchema)}
            title={title}
            required={required}
            schema={templateSchema}
            uiSchema={uiSchema}
            registry={registry}
          />
        )}
        {description && (
          <DescriptionFieldTemplate
            id={descriptionId(idSchema)}
            description={description}
            schema={templateSchema}
            uiSchema={uiSchema}
            registry={registry}
          />
        )}
        <Grid container spacing={2} style={{ marginTop: '10px' }}>
          {templateProperties.map((element, index) => {
            if (element.hidden) {
              return <React.Fragment key={index}>{element.content}</React.Fragment>;
            }

            const context = formContext;
            const isRootField =
              Boolean(isRootObject && context && context.rootFieldNames.includes(element.name));
            const isEditing = Boolean(isRootField && context && context.editingFieldName === element.name);

            return (
              <Grid item xs={12} key={index} style={{ marginBottom: '10px' }}>
                <div className={`preview-field${isEditing ? ' editing' : ''}`}>
                  <div className="preview-field-content">{element.content}</div>
                  {isRootField && context && (
                    <div className="preview-field-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-small"
                        onClick={() => context.onEditField(element.name)}
                        disabled={context.isSavingField}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => context.onDeleteField(element.name)}
                        disabled={context.isSavingField}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </Grid>
            );
          })}
          {canExpand(templateSchema, uiSchema, formData) && (
            <Grid container justifyContent="flex-end">
              <Grid item>
                <AddButton
                  className="object-property-expand"
                  onClick={onAddClick(templateSchema)}
                  disabled={disabled || readonly}
                  uiSchema={uiSchema}
                  registry={registry}
                />
              </Grid>
            </Grid>
          )}
        </Grid>
      </>
    );
  };

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
            <h4>{editingFieldName ? 'Edit Field' : 'Add New Field'}</h4>
            <p>
              {editingFieldName
                ? `Updating field "${editingFieldName}".`
                : 'Configure a new form field to add to your configuration'}
            </p>
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

                {["text", "textarea", "email", "search", "url", "tel", "time", "datetime", "datetime-local", "month", "week"].includes(field.type) && (
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
              onClick={saveFieldToSchema}
              disabled={!field.name.trim() || isSavingField}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {editingFieldName ? 'Save Field Changes' : 'Add Field to Schema'}
            </button>
            <button
              className="btn btn-ghost"
              onClick={resetFieldBuilder}
              disabled={isSavingField}
            >
              {editingFieldName ? 'Cancel Editing' : 'Clear Form'}
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
              {!hasFields && (
                <div className="preview-empty-state">
                  <p>No fields yet. Add a field using the form builder to see it here.</p>
                </div>
              )}
              <Form
                key={selectedConfig?.id || 'no-config'}
                schema={schema}
                uiSchema={uiSchema}
                formData={formData}
                validator={validator}
                templates={{ ObjectFieldTemplate: FieldActionsObjectTemplate }}
                formContext={{
                  onEditField: handleEditField,
                  onDeleteField: handleDeleteField,
                  rootFieldNames,
                  editingFieldName,
                  isSavingField,
                }}
                onSubmit={handleSubmit}
                onError={() => {
                  onNotification?.('error', 'Please resolve validation errors before saving.');
                }}
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

