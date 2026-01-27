import { Component, input, output } from '@angular/core';


@Component({
  selector: 'dc-empty-state',
  standalone: true,
  imports: [],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  icon = input<string>('/assets/dino-sad.svg');
  title = input.required<string>();
  message = input.required<string>();
  buttonText = input<string>('');
  showButton = input<boolean>(true);

  buttonClick = output<void>();
}

