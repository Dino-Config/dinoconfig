import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dc-error-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss'
})
export class ErrorStateComponent {
  message = input.required<string>();
  retryButtonText = input<string>('Try Again');
  showRetry = input<boolean>(true);

  retry = output<void>();
}

