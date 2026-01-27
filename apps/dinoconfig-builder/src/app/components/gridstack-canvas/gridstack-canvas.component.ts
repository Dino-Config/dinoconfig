import { Component, input, output, TrackByFunction, inject } from '@angular/core';

import { GridStackOptions, GridStackWidget } from 'gridstack';
import { GridstackComponent, GridstackItemComponent } from 'gridstack/dist/angular';
import { GridFieldConfig } from '../../models/config.models';
import { PaletteItem } from '../form-element-palette/form-element-palette.component';
import { FieldUtilsService } from '../../services/field-utils.service';
import { getFieldComponentSelector } from '../form-elements/field-component-registry';
import { TextInputElementComponent } from '../form-elements/text-input-element/text-input-element.component';
import { NumberInputElementComponent } from '../form-elements/number-input-element/number-input-element.component';
import { TextareaElementComponent } from '../form-elements/textarea-element/textarea-element.component';
import { CheckboxElementComponent } from '../form-elements/checkbox-element/checkbox-element.component';
import { RadioGroupElementComponent } from '../form-elements/radio-group-element/radio-group-element.component';
import { SelectElementComponent } from '../form-elements/select-element/select-element.component';
import { RangeElementComponent } from '../form-elements/range-element/range-element.component';
import { DatePickerElementComponent } from '../form-elements/date-picker-element/date-picker-element.component';
import { TimePickerElementComponent } from '../form-elements/time-picker-element/time-picker-element.component';
import { DatetimePickerElementComponent } from '../form-elements/datetime-picker-element/datetime-picker-element.component';

@Component({
  selector: 'dc-gridstack-canvas',
  standalone: true,
  imports: [
    GridstackComponent,
    GridstackItemComponent,
    TextInputElementComponent,
    NumberInputElementComponent,
    TextareaElementComponent,
    CheckboxElementComponent,
    RadioGroupElementComponent,
    SelectElementComponent,
    RangeElementComponent,
    DatePickerElementComponent,
    TimePickerElementComponent,
    DatetimePickerElementComponent
],
  templateUrl: './gridstack-canvas.component.html',
  styleUrl: './gridstack-canvas.component.scss'
})
export class GridStackCanvasComponent {
  // Signal-based inputs
  fields = input<GridFieldConfig[]>([]);
  formData = input<Record<string, any>>({});
  
  // Signal-based outputs
  fieldsChange = output<GridFieldConfig[]>();
  formDataChange = output<Record<string, any>>();
  editField = output<GridFieldConfig>();
  deleteField = output<string>();

  private fieldUtils = inject(FieldUtilsService);
  private elementCounter = 0;

  readonly gridOptions: GridStackOptions = {
    cellHeight: '7rem',
    minRow: 1,
    float: true,
    margin: 5
  };

  trackByFieldId: TrackByFunction<GridFieldConfig> = (index: number, field: GridFieldConfig) => field.id;

  onGridChange(event: any): void {
    // GridStack Angular component's change event structure can vary
    // We'll use a reliable approach: query DOM directly for GridStack nodes
    // GridStack stores position data in gridstackNode on each item element
    
    // Use requestAnimationFrame to ensure DOM is fully updated after GridStack moves items
    requestAnimationFrame(() => {
      const currentFields = this.fields();
      const itemMap = new Map<string, { x: number; y: number; w: number; h: number }>();
      
      // Query the grid container - use a more specific selector
      const gridElement = document.querySelector('gridstack .grid-stack') || 
                         document.querySelector('.grid-stack');
      
      if (gridElement) {
        const gridItems = gridElement.querySelectorAll('.grid-stack-item');
        gridItems.forEach((el: Element) => {
          const node = (el as any).gridstackNode;
          if (node && node.id) {
            const id = String(node.id);
            itemMap.set(id, {
              x: node.x ?? 0,
              y: node.y ?? 0,
              w: node.w ?? 4,
              h: node.h ?? 1
            });
          }
        });
      }
      
      // Also try to extract from event if it has items
      if (itemMap.size === 0) {
        let items: any[] = [];
        if (Array.isArray(event)) {
          items = event;
        } else if (event?.items && Array.isArray(event.items)) {
          items = event.items;
        }
        
        items.forEach((item: any) => {
          const id = String(item.id || item.el?.getAttribute?.('gs-id') || '');
          if (id && typeof item.x === 'number' && typeof item.y === 'number') {
            itemMap.set(id, {
              x: item.x,
              y: item.y,
              w: item.w ?? 4,
              h: item.h ?? 1
            });
          }
        });
      }
      
      if (itemMap.size > 0) {
        this.updateFieldsFromMap(itemMap, currentFields);
      }
    });
  }
  
  private updateFieldsFromMap(
    itemMap: Map<string, { x: number; y: number; w: number; h: number }>,
    currentFields: GridFieldConfig[]
  ): void {
    if (itemMap.size === 0) {
      return;
    }
    
    const updatedFields: GridFieldConfig[] = currentFields.map(field => {
      const position = itemMap.get(field.id);
      if (position) {
        return {
          ...field,
          x: position.x,
          y: position.y,
          w: position.w,
          h: position.h
        };
      }
      return field;
    });
    
    // Only emit if positions actually changed
    const hasChanges = updatedFields.some((field, index) => {
      const original = currentFields[index];
      return !original || 
        field.x !== original.x || 
        field.y !== original.y || 
        field.w !== original.w || 
        field.h !== original.h;
    });
    
    if (hasChanges) {
      this.fieldsChange.emit(updatedFields);
    }
  }

  addElement(item: PaletteItem): void {
    this.elementCounter++;
    const sizes = this.fieldUtils.getDefaultSizes(item.type);
    const newField: GridFieldConfig = {
      id: this.fieldUtils.createFieldId(),
      name: `${item.type}_${this.elementCounter}`,
      type: item.type,
      label: item.label,
      options: '',
      required: false,
      x: 0,
      y: 0,
      w: sizes.w,
      h: sizes.h,
    };

    const currentFields = this.fields();
    this.fieldsChange.emit([...currentFields, newField]);
  }

  onValueChange(fieldName: string, value: any): void {
    const currentData = this.formData();
    this.formDataChange.emit({ ...currentData, [fieldName]: value });
  }

  onEdit(field: GridFieldConfig): void {
    this.editField.emit(field);
  }

  onDelete(fieldId: string): void {
    this.deleteField.emit(fieldId);
  }

  addElementFromPalette(item: PaletteItem): void {
    this.addElement(item);
  }

  getComponentSelector(fieldType: string): string {
    return getFieldComponentSelector(fieldType as any);
  }
}

