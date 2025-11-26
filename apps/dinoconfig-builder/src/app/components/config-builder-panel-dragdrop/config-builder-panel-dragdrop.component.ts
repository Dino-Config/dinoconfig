import { Component, input, output, viewChild, signal, computed, effect, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Config, GridFieldConfig, FieldConfig } from '../../models/config.models';
import { ConfigService } from '../../services/config.service';
import { FieldUtilsService } from '../../services/field-utils.service';
import { FormElementPaletteComponent, PaletteItem } from '../form-element-palette/form-element-palette.component';
import { GridStackCanvasComponent } from '../gridstack-canvas/gridstack-canvas.component';
import { FieldEditModalComponent, FieldEditModalData } from '../field-edit-modal/field-edit-modal.component';

@Component({
  selector: 'dc-config-builder-panel-dragdrop',
  standalone: true,
  imports: [CommonModule, FormElementPaletteComponent, GridStackCanvasComponent],
  templateUrl: './config-builder-panel-dragdrop.component.html',
  styleUrl: './config-builder-panel-dragdrop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigBuilderPanelDragDropComponent {
  // Signal-based inputs
  selectedConfig = input<Config | null>(null);
  brandId = input<number | null>(null);
  formData = input<Record<string, any>>({});
  
  // Signal-based outputs
  formDataChange = output<Record<string, any>>();
  configUpdated = output<{ config: Config; versions: Config[]; previousConfigId: number }>();
  notification = output<{ type: 'success' | 'error' | 'warning' | 'info'; message: string }>();

  // ViewChild as signal
  canvasComponent = viewChild(GridStackCanvasComponent);

  private configService = inject(ConfigService);
  private dialog = inject(MatDialog);
  private fieldUtils = inject(FieldUtilsService);
  
  gridFields = signal<GridFieldConfig[]>([]);
  isSavingConfig = signal(false);

  // Computed for formData access
  private currentFormData = computed(() => this.formData());

  constructor() {
    // Effect to load fields when selectedConfig changes
    effect(() => {
      const config = this.selectedConfig();
      if (config) {
        this.loadGridFields(config);
      } else {
        this.gridFields.set([]);
      }
    });
  }

  private loadGridFields(config: Config): void {
    const layout = config?.layout;
    if (!layout || !Array.isArray(layout) || layout.length === 0) {
      this.gridFields.set([]);
      return;
    }

    const validatedLayout = layout.map((field: any) => ({
      ...field,
      id: field.id || this.fieldUtils.createFieldId(),
      x: typeof field.x === 'number' ? field.x : 0,
      y: typeof field.y === 'number' ? field.y : 0,
      w: typeof field.w === 'number' ? field.w : 4,
      h: typeof field.h === 'number' ? field.h : 1,
    } as GridFieldConfig));
    
    this.gridFields.set(validatedLayout);
  }

  onAddElement(item: PaletteItem): void {
    const canvas = this.canvasComponent();
    if (canvas) {
      canvas.addElementFromPalette(item);
    }
  }

  onFieldsChange(fields: GridFieldConfig[]): void {
    this.gridFields.set(fields);
    
    // Update formData with default values for new fields
    const currentData = this.currentFormData();
    const newFormData = { ...currentData };
    const existingNames = new Set(Object.keys(newFormData));
    
    fields.forEach(field => {
      if (!existingNames.has(field.name)) {
        newFormData[field.name] = this.fieldUtils.getDefaultValue(field.type, field.options);
      }
    });
    
    this.formDataChange.emit(newFormData);
  }

  onEditField(field: GridFieldConfig): void {
    const dialogData: FieldEditModalData = {
      mode: 'edit',
      field: this.fieldUtils.mapToFieldConfig(field),
      title: `Edit Field: ${field.name}`
    };

    const dialogRef = this.dialog.open(FieldEditModalComponent, {
      width: '720px',
      maxWidth: '90vw',
      data: dialogData,
      panelClass: 'field-edit-modal-dialog'
    });

    dialogRef.afterClosed().subscribe((result: FieldConfig | undefined) => {
      if (result && this.fieldUtils.validateFieldConfig(result)) {
        this.saveEditedField(field.id, result);
      }
    });
  }

  private saveEditedField(fieldId: string, updatedField: FieldConfig): void {
    const originalField = this.gridFields().find(f => f.id === fieldId);
    if (!originalField) {
      this.notification.emit({ type: 'error', message: 'Field not found' });
      return;
    }

    const trimmedName = updatedField.name.trim();
    const updatedFields = this.gridFields().map(f => 
      f.id === fieldId 
        ? { ...f, ...updatedField, name: trimmedName }
        : f
    );

    this.gridFields.set(updatedFields);

    // Update formData if name changed
    if (originalField.name !== trimmedName) {
      const currentData = this.currentFormData();
      const updatedFormData = { ...currentData };
      if (originalField.name in updatedFormData) {
        updatedFormData[trimmedName] = updatedFormData[originalField.name];
        delete updatedFormData[originalField.name];
      }
      this.formDataChange.emit(updatedFormData);
    }

    this.notification.emit({ type: 'success', message: `Field "${trimmedName}" updated successfully!` });
  }

  onDeleteField(fieldId: string): void {
    const field = this.gridFields().find(f => f.id === fieldId);
    if (!field) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete the field "${field.label || field.name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    const updatedFields = this.gridFields().filter(f => f.id !== fieldId);
    this.gridFields.set(updatedFields);

    // Remove from formData
    const currentData = this.currentFormData();
    const updatedFormData = { ...currentData };
    delete updatedFormData[field.name];
    this.formDataChange.emit(updatedFormData);
    this.notification.emit({ type: 'success', message: `Field "${field.label || field.name}" deleted successfully.` });
  }

  onSaveConfig(): void {
    const config = this.selectedConfig();
    const brand = this.brandId();
    
    if (!config || !brand) {
      this.notification.emit({ type: 'error', message: 'No configuration selected' });
      return;
    }

    this.isSavingConfig.set(true);
    this.configService.updateConfigLayout(
      brand,
      config.id,
      {
        layout: this.gridFields(),
        formData: this.currentFormData(),
      }
    ).subscribe({
      next: (response) => {
        this.configUpdated.emit({
          config: response.config,
          versions: response.versions,
          previousConfigId: config.id
        });
        this.notification.emit({ type: 'success', message: 'Configuration saved successfully!' });
        this.isSavingConfig.set(false);
      },
      error: (error: any) => {
        const message = error?.error?.message || error?.message || 'Failed to save configuration. Please try again.';
        this.notification.emit({ type: 'error', message });
        this.isSavingConfig.set(false);
      }
    });
  }

  onExportSchema(): void {
    const config = this.selectedConfig();
    const exportSchema = {
      layout: this.gridFields(),
      formData: this.currentFormData(),
      metadata: {
        configName: config?.name,
        configId: config?.id,
        version: config?.version,
        exportedAt: new Date().toISOString(),
      }
    };

    this.downloadJSON(exportSchema, `${config?.name || 'config'}-layout.json`);
    this.notification.emit({ type: 'success', message: 'Layout schema exported successfully!' });
  }

  private downloadJSON(data: any, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

