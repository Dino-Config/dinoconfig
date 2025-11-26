import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { GridFieldConfig } from '../../../models/config.models';
import { BaseFormElementComponent } from '../base-form-element/base-form-element.component';

@Component({
  selector: 'dc-range-element',
  standalone: true,
  imports: [CommonModule, MatSliderModule, FormsModule, BaseFormElementComponent],
  templateUrl: './range-element.component.html',
  styleUrl: './range-element.component.scss'
})
export class RangeElementComponent {
  config = input.required<GridFieldConfig>();
  value = input<any>();
  isEditable = input<boolean>(true);
  valueChange = output<any>();
  edit = output<void>();
  delete = output<void>();

  sliderValue = signal<number>(0);

  minValue = computed(() => this.config().min ?? 0);
  maxValue = computed(() => this.config().max ?? 100);
  currentValue = computed(() => {
    const val = this.value();
    return val !== undefined ? val : this.minValue();
  });

  constructor() {
    // Sync slider value when value or config changes
    effect(() => {
      this.sliderValue.set(this.currentValue());
    });
  }

  onValueChange(newValue: number | null): void {
    if (newValue !== null) {
      this.sliderValue.set(newValue);
      this.valueChange.emit(newValue);
    }
  }
}

