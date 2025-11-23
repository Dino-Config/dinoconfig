import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'dc-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {
  size = input<'small' | 'medium' | 'large'>('medium');
  text = input<string>('');
  fullHeight = input<boolean>(false);

  spinnerDiameter = computed(() => {
    const sizeMap = {
      small: 24,
      medium: 40,
      large: 60
    };
    return sizeMap[this.size()];
  });
}

