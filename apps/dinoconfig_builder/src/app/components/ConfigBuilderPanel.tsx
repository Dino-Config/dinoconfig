import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Form } from '@rjsf/mui';
import validator from "@rjsf/validator-ajv8";
import { JSONSchema7 } from "json-schema";
import { IChangeEvent } from "@rjsf/core";
import Grid from "@mui/material/Grid";
import { ObjectFieldTemplateProps, canExpand, descriptionId, getTemplate, getUiOptions, titleId } from "@rjsf/utils";
import { Config, FieldConfig, FieldType } from '../types';
import FieldFormView, { FieldFormMode } from './FieldForm';
import FieldEditModal from './FieldEditModal';
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editField, setEditField] = useState<FieldConfig>(createEmptyFieldConfig());
  const [showEditValidations, setShowEditValidations] = useState(false);

  // Reset preview state when config changes
  useEffect(() => {
    setShowPreview(true);
    setShowJsonData(true);
  }, [selectedConfig?.id]);

  // Memoize callbacks - must be before any conditional returns
  const handleSubmit = useCallback((event: IChangeEvent) => {
    onFormDataChange(event.formData);
    onSave();
  }, [onFormDataChange, onSave]);

  const handleFormChange = useCallback((e: IChangeEvent) => {
    onFormDataChange(e.formData);
  }, [onFormDataChange]);

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

  const resetAddFieldForm = () => {
    setField(createEmptyFieldConfig());
    setShowValidations(false);
  };

  const openAddModal = () => {
    resetAddFieldForm();
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    resetAddFieldForm();
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingFieldName(null);
    setEditField(createEmptyFieldConfig());
    setShowEditValidations(false);
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

  const saveField = async (
    fieldDraft: FieldConfig,
    options: { mode: FieldFormMode; originalName?: string }
  ) => {
    if (!fieldDraft.name?.trim()) {
      onNotification?.('warning', 'Please enter a field name');
      return;
    }

    const trimmedName = fieldDraft.name.trim();

    if (options.mode === 'edit') {
      if (!brandId || !selectedConfig) {
        onNotification?.('error', 'Select a configuration before editing fields.');
        return;
      }

      try {
        setIsSavingField(true);
        const response = await ConfigService.updateField(
          brandId,
          selectedConfig.id,
          options.originalName ?? trimmedName,
          {
            name: trimmedName,
            label: fieldDraft.label?.trim() || undefined,
            type: fieldDraft.type,
            options: fieldDraft.options ? fieldDraft.options : undefined,
            required: fieldDraft.required,
            min: fieldDraft.min,
            max: fieldDraft.max,
            maxLength: fieldDraft.maxLength,
            pattern: fieldDraft.pattern,
          }
        );

        onConfigUpdated(response.config, response.versions, selectedConfig.id);
        onNotification?.('success', `Field "${trimmedName}" updated successfully!`);
        closeEditModal();
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

    const baseType = getSchemaType(fieldDraft.type);
    const newField: any = { type: baseType, title: fieldDraft.label || trimmedName };

    if (["select", "radio"].includes(fieldDraft.type) && fieldDraft.options) {
      newField.enum = fieldDraft.options.split(",").map(o => o.trim()).filter(Boolean);
    }

    if (typeof fieldDraft.min === "number") newField.minimum = fieldDraft.min;
    if (typeof fieldDraft.max === "number") newField.maximum = fieldDraft.max;
    if (typeof fieldDraft.maxLength === "number") newField.maxLength = fieldDraft.maxLength;
    if (fieldDraft.pattern) newField.pattern = fieldDraft.pattern;

    const updatedProperties = { ...(schema.properties || {}) };
    updatedProperties[trimmedName] = newField;

    const requiredSet = new Set<string>(Array.isArray(schema.required) ? schema.required as string[] : []);
    if (fieldDraft.required) {
      requiredSet.add(trimmedName);
    } else {
      requiredSet.delete(trimmedName);
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

    const widget = getWidget(fieldDraft.type);
    const uiEntry = createUiEntry(fieldDraft.type, widget);
    const updatedUiSchema = { ...uiSchema };

    // Remove empty UI entries to keep schema clean
    if (uiEntry && Object.keys(uiEntry).length > 0) {
      updatedUiSchema[trimmedName] = uiEntry;
    } else {
      delete updatedUiSchema[trimmedName];
    }
    onUiSchemaChange(updatedUiSchema);

    const updatedFormData = { ...formData };
    if (!(trimmedName in updatedFormData)) {
      updatedFormData[trimmedName] = getDefaultValueForField(fieldDraft.type, fieldDraft.options);
    }

    onFormDataChange(updatedFormData);

    onNotification?.('success', `Field "${trimmedName}" added successfully!`);
    closeAddModal();
    scrollToPreview();
  };

  const handleEditField = useCallback((name: string) => {
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

    setEditField({
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
    setShowEditValidations(hasValidations);
    setIsEditModalOpen(true);
    setShowPreview(true);
  }, [schema]);

  const handleDeleteField = useCallback(async (name: string) => {
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
        closeEditModal();
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
  }, [schema, brandId, selectedConfig, editingFieldName, onConfirm, onNotification, onConfigUpdated]);

  // Memoize rootFieldNames to prevent unnecessary re-renders - must be before conditional return
  const properties = (schema.properties ?? {}) as Record<string, any>;
  const fieldEntries = Object.entries(properties);
  const rootFieldNames = useMemo(() => {
    return fieldEntries.map(([name]) => name);
  }, [schema.properties]);
  
  // Memoize formContext to prevent Form re-renders on every keystroke - must be before conditional return
  const formContext = useMemo(() => ({
    onEditField: handleEditField,
    onDeleteField: handleDeleteField,
    rootFieldNames,
    editingFieldName,
    isSavingField,
  }), [handleEditField, handleDeleteField, rootFieldNames, editingFieldName, isSavingField]);

  // Define FieldActionsObjectTemplate before conditional return so templates can reference it
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
    const [expandedFieldName, setExpandedFieldName] = useState<string | null>(null);
    const isRootObject = idSchema?.$id === 'root';

    useEffect(() => {
      if (formContext?.isSavingField) {
        setExpandedFieldName(null);
      }
    }, [formContext?.isSavingField]);

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
              return <React.Fragment key={`hidden-${index}`}>{element.content}</React.Fragment>;
            }

            const context = formContext;
            const isRootField =
              Boolean(isRootObject && context && context.rootFieldNames.includes(element.name));
            const isEditing = Boolean(isRootField && context && context.editingFieldName === element.name);

            // Use element.name as key for stable identity, fallback to index if name is not available
            const elementKey = element.name || `field-${index}`;

            return (
              <Grid item xs={12} key={elementKey} style={{ marginBottom: '10px' }}>
                <div className={`preview-field${isEditing ? ' editing' : ''}`}>
                  <div className="preview-field-content">{element.content}</div>
                  {isRootField && context && (
                    <div className="preview-field-actions">
                      <button
                        type="button"
                        className="menu-btn"
                        onClick={() =>
                          setExpandedFieldName(expandedFieldName === element.name ? null : element.name)
                        }
                        disabled={context.isSavingField}
                      >
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M8 8.833a.833.833 0 100-1.666.833.833 0 000 1.666zM8 4.167a.833.833 0 100-1.667.833.833 0 000 1.667zM8 13.5a.833.833 0 100-1.667A.833.833 0 008 13.5z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                      {expandedFieldName === element.name && (
                        <div className="field-action-menu">
                          <button
                            type="button"
                            className="action-btn edit"
                            onClick={() => {
                              setExpandedFieldName(null);
                              context.onEditField(element.name);
                            }}
                            disabled={context.isSavingField}
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
                            Edit
                          </button>
                          <button
                            type="button"
                            className="action-btn delete"
                            onClick={() => {
                              setExpandedFieldName(null);
                              context.onDeleteField(element.name);
                            }}
                            disabled={context.isSavingField}
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
                            Delete
                          </button>
                        </div>
                      )}
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

  // Memoize templates object to prevent Form re-renders - must be before conditional return
  const templates = useMemo(() => ({
    ObjectFieldTemplate: FieldActionsObjectTemplate
  }), []); // FieldActionsObjectTemplate is stable

  if (!selectedConfig) {
    return (
      <div className="config-builder-panel">
        <div className="panel-header">
          <h3 className="section-title">Configuration Builder</h3>
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

  const hasFields = fieldEntries.length > 0;

  return (
    <div className="config-builder-panel">
      <div className="panel-header">
        <div className="header-content">
          <h3 className="section-title">{selectedConfig.name}</h3>
          <p className="section-subtitle">Add and configure form fields</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={openAddModal}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add Field
          </button>
          <button className="btn btn-outline" onClick={onExport}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10M11.333 5.333L8 2m0 0L4.667 5.333M8 2v8" 
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export
          </button>
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
                <h4>Configurations</h4>
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
                templates={templates}
                formContext={formContext}
                onSubmit={handleSubmit}
                onError={() => {
                  onNotification?.('error', 'Please resolve validation errors before saving.');
                }}
                onChange={handleFormChange}
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

      </div>

      <FieldEditModal
        isOpen={isAddModalOpen}
        title="Add New Field"
        onClose={closeAddModal}
      >
        <div className="field-builder-style-scope field-edit-modal-content">
          <FieldFormView
            mode="add"
            field={field}
            setField={setField}
            showValidations={showValidations}
            setShowValidations={setShowValidations}
            onSave={() => saveField(field, { mode: 'add' })}
            onCancel={closeAddModal}
            isSaving={isSavingField}
          />
        </div>
      </FieldEditModal>

      <FieldEditModal
        isOpen={isEditModalOpen}
        title={editingFieldName ? `Edit Field: ${editingFieldName}` : 'Edit Field'}
        onClose={closeEditModal}
      >
        <div className="field-builder-style-scope field-edit-modal-content">
          <FieldFormView
            mode="edit"
            field={editField}
            setField={setEditField}
            showValidations={showEditValidations}
            setShowValidations={setShowEditValidations}
            onSave={() => {
              if (!editingFieldName) {
                return;
              }
              return saveField(editField, { mode: 'edit', originalName: editingFieldName });
            }}
            onCancel={closeEditModal}
            isSaving={isSavingField}
          />
        </div>
      </FieldEditModal>
    </div>
  );
}

