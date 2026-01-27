import { Component, input, output } from '@angular/core';


@Component({
  selector: 'dc-error-state',
  standalone: true,
  imports: [],
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss'
})
export class ErrorStateComponent {
  message = input.required<string>();
  retryButtonText = input<string>('Try Again');
  showRetry = input<boolean>(true);

  retry = output<void>();
}

