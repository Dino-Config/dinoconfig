import { Component, input, output, TrackByFunction, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'dc-gridstack-canvas',
  standalone: true,
  imports: [
    CommonModule,
    GridstackComponent,
    GridstackItemComponent,
    TextInputElementComponent,
    NumberInputElementComponent,
    TextareaElementComponent,
    CheckboxElementComponent,
    RadioGroupElementComponent,
    SelectElementComponent,
    RangeElementComponent,
    DatePickerElementComponent
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
    const items: GridStackWidget[] = Array.isArray(event) ? event : (event?.items || []);
    const itemMap = new Map(items.map((item: any) => [item.id, item]));
    const currentFields = this.fields();
    
    const updatedFields = currentFields.map(field => {
      const item = itemMap.get(field.id);
      return item 
        ? { ...field, x: item.x || 0, y: item.y || 0, w: item.w || field.w, h: item.h || field.h }
        : field;
    });
    
    this.fieldsChange.emit(updatedFields);
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

