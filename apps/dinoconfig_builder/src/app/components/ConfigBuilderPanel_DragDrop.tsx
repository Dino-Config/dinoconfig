import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { JSONSchema7 } from "json-schema";
import { Config, GridFieldConfig, FieldConfig, FieldType } from '../types';
import FieldFormView, { FieldFormMode } from './FieldForm';
import FieldEditModal from './FieldEditModal';
import FormElementPalette, { PaletteItem } from './FormElementPalette';
import GridStackCanvas, { GridStackCanvasRef } from './GridStackCanvas';
import './ConfigBuilderPanel.scss';
import './ConfigBuilderPanelDragDrop.scss';
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
  const [gridFields, setGridFields] = useState<GridFieldConfig[]>([]);
  const [editingField, setEditingField] = useState<GridFieldConfig | null>(null);
  const canvasRef = useRef<GridStackCanvasRef>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showEditValidations, setShowEditValidations] = useState(false);
  const [editField, setEditField] = useState<FieldConfig>(createEmptyFieldConfig());
  const [isSavingField, setIsSavingField] = useState(false);

  // Load grid fields from selected config's layout
  useEffect(() => {
    if (selectedConfig?.layout) {
      setGridFields(selectedConfig.layout);
    } else {
      setGridFields([]);
    }
  }, [selectedConfig?.id]);

  const handleAddElement = useCallback((item: PaletteItem) => {
    console.log('handleAddElement called with:', item);
    console.log('canvasRef.current:', canvasRef.current);
    console.log('canvasRef.current?.addElement:', canvasRef.current?.addElement);
    if (canvasRef.current) {
      console.log('Calling canvasRef.current.addElement...');
      canvasRef.current.addElement(item);
    } else {
      console.error('Canvas ref is null! GridStackCanvas may not be mounted yet.');
    }
  }, []);

  const handleFieldsChange = useCallback((fields: GridFieldConfig[]) => {
    setGridFields(fields);
    
    // Update formData with default values for new fields
    const newFormData = { ...formData };
    fields.forEach(field => {
      if (!(field.name in newFormData)) {
        newFormData[field.name] = getDefaultValueForField(field.type, field.options);
      }
    });
    onFormDataChange(newFormData);
  }, [formData, onFormDataChange]);

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

  const handleEditField = useCallback((field: GridFieldConfig) => {
    const hasValidations = field.required ||
      typeof field.min === "number" ||
      typeof field.max === "number" ||
      typeof field.maxLength === "number" ||
      typeof field.pattern === "string";

    setEditField({
      name: field.name,
      type: field.type,
      label: field.label || "",
      options: field.options || "",
      required: field.required || false,
      min: field.min,
      max: field.max,
      maxLength: field.maxLength,
      pattern: field.pattern,
    });

    setEditingField(field);
    setShowEditValidations(hasValidations);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteField = useCallback(async (fieldId: string) => {
    const field = gridFields.find(f => f.id === fieldId);
    if (!field) return;

    const confirmDelete = await onConfirm(
      "Delete Field",
      `Are you sure you want to delete the field "${field.label || field.name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    const updatedFields = gridFields.filter(f => f.id !== fieldId);
    setGridFields(updatedFields);

    // Remove from formData
    const updatedFormData = { ...formData };
    delete updatedFormData[field.name];
    onFormDataChange(updatedFormData);

    onNotification?.('success', `Field "${field.label || field.name}" deleted successfully.`);
  }, [gridFields, formData, onConfirm, onFormDataChange, onNotification]);

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingField(null);
    setEditField(createEmptyFieldConfig());
    setShowEditValidations(false);
  };

  const saveEditedField = async (fieldDraft: FieldConfig) => {
    if (!editingField) return;
    if (!fieldDraft.name?.trim()) {
      onNotification?.('warning', 'Please enter a field name');
      return;
    }

    const trimmedName = fieldDraft.name.trim();

    try {
      setIsSavingField(true);

      // Update the grid field
      const updatedFields = gridFields.map(f => {
        if (f.id === editingField.id) {
          return {
            ...f,
            name: trimmedName,
            type: fieldDraft.type,
            label: fieldDraft.label,
            options: fieldDraft.options,
            required: fieldDraft.required,
            min: fieldDraft.min,
            max: fieldDraft.max,
            maxLength: fieldDraft.maxLength,
            pattern: fieldDraft.pattern,
          };
        }
        return f;
      });

      setGridFields(updatedFields);

      // Update formData if name changed
      if (editingField.name !== trimmedName) {
        const updatedFormData = { ...formData };
        if (editingField.name in updatedFormData) {
          updatedFormData[trimmedName] = updatedFormData[editingField.name];
          delete updatedFormData[editingField.name];
        }
        onFormDataChange(updatedFormData);
      }

      onNotification?.('success', `Field "${trimmedName}" updated successfully!`);
      closeEditModal();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update field. Please try again.';
      onNotification?.('error', message);
    } finally {
      setIsSavingField(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedConfig || !brandId) {
      onNotification?.('error', 'No configuration selected');
      return;
    }

    try {
      // Save the layout and formData
      const response = await ConfigService.updateConfigLayout(
        brandId,
        selectedConfig.id,
        {
          layout: gridFields,
          formData: formData,
        }
      );

      onConfigUpdated(response.config, response.versions, selectedConfig.id);
      onNotification?.('success', 'Configuration saved successfully!');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save configuration. Please try again.';
      onNotification?.('error', message);
    }
  };

  const handleExportSchema = () => {
    // Generate JSON schema from grid fields
    const exportSchema = {
      layout: gridFields,
      formData: formData,
      metadata: {
        configName: selectedConfig?.name,
        configId: selectedConfig?.id,
        version: selectedConfig?.version,
        exportedAt: new Date().toISOString(),
      }
    };

    const blob = new Blob([JSON.stringify(exportSchema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedConfig?.name || 'config'}-layout.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onNotification?.('success', 'Layout schema exported successfully!');
  };

  if (!selectedConfig) {
    return (
      <div className="config-builder-panel dragdrop-mode">
        <div className="panel-header">
          <h3 className="section-title">Configuration Builder</h3>
          <p className="section-subtitle">Create or select a config to get started</p>
        </div>
        <div className="builder-disabled">
          <div className="empty-state">
            <img src="assets/dino-sad.svg" alt="No configuration selected" className="empty-icon-svg" />
            <h4>No Configuration Selected</h4>
            <p>Please create or select a configuration from the sidebar to start building your form.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="config-builder-panel dragdrop-mode">
      <div className="panel-header">
        <div className="header-content">
          <h3 className="section-title">{selectedConfig.name}</h3>
          <p className="section-subtitle">Drag and drop form elements to build your configuration</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-success" onClick={handleSaveConfig}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Save Configuration
          </button>
          <button className="btn btn-outline" onClick={handleExportSchema}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10M11.333 5.333L8 2m0 0L4.667 5.333M8 2v8" 
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export Layout
          </button>
        </div>
      </div>

      <div className="dragdrop-workspace">
        <div className="workspace-sidebar">
          <FormElementPalette onAddElement={handleAddElement} />
        </div>
        
        <div className="workspace-canvas">
          <GridStackCanvas
            ref={canvasRef}
            fields={gridFields}
            formData={formData}
            onFieldsChange={handleFieldsChange}
            onFormDataChange={onFormDataChange}
            onEditField={handleEditField}
            onDeleteField={handleDeleteField}
            draggedItem={null}
          />
        </div>
      </div>

      <FieldEditModal
        isOpen={isEditModalOpen}
        title={editingField ? `Edit Field: ${editingField.name}` : 'Edit Field'}
        onClose={closeEditModal}
      >
        <div className="field-builder-style-scope field-edit-modal-content">
          <FieldFormView
            mode="edit"
            field={editField}
            setField={setEditField}
            showValidations={showEditValidations}
            setShowValidations={setShowEditValidations}
            onSave={() => saveEditedField(editField)}
            onCancel={closeEditModal}
            isSaving={isSavingField}
          />
        </div>
      </FieldEditModal>
    </div>
  );
}

