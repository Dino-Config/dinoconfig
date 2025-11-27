import { Component, input, output, signal, computed, effect, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FieldConfig, FieldType } from '../../models/config.models';
import { FieldTypeSelectorComponent } from '../field-type-selector/field-type-selector.component';
import { FieldUtilsService } from '../../services/field-utils.service';

export type FieldFormMode = 'add' | 'edit';

@Component({
  selector: 'dc-field-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    FieldTypeSelectorComponent
  ],
  templateUrl: './field-form.component.html',
  styleUrl: './field-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldFormComponent {
  // Signal-based inputs
  mode = input<FieldFormMode>('add');
  field = input.required<FieldConfig>();
  
  // Signal-based outputs
  save = output<FieldConfig>();
  cancel = output<void>();

  private fieldUtils = inject(FieldUtilsService);

  showValidations = signal(false);
  isSaving = signal(false);
  
  fieldData = signal<FieldConfig>({
    name: '',
    type: 'text',
    label: '',
    options: '',
    required: false
  });

  isChoiceField = computed(() => this.fieldUtils.isChoiceType(this.fieldData().type));
  isNumberField = computed(() => this.fieldUtils.isNumberType(this.fieldData().type));
  isTextLikeField = computed(() => this.fieldUtils.isTextType(this.fieldData().type));
  isValid = computed(() => !!this.fieldData().name?.trim());

  constructor() {
    // Effect to sync field input with fieldData signal
    effect(() => {
      const fieldValue = this.field();
      if (fieldValue) {
        this.fieldData.set({ ...fieldValue });
      }
    });
  }

  updateField(key: keyof FieldConfig, value: any): void {
    this.fieldData.update(prev => ({
      ...prev,
      [key]: value
    }));
  }

  onTypeChange(type: FieldType): void {
    this.updateField('type', type);
  }

  toggleValidations(): void {
    this.showValidations.update(v => !v);
  }

  onSave(): void {
    if (!this.isValid()) return;
    
    this.isSaving.set(true);
    this.save.emit({ ...this.fieldData() });
    this.isSaving.set(false);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  parseNumber(value: string): number | undefined {
    return value ? Number(value) : undefined;
  }
}

