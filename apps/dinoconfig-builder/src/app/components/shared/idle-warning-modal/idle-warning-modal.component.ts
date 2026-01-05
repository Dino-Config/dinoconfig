import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dc-idle-warning-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './idle-warning-modal.component.html',
  styleUrl: './idle-warning-modal.component.scss'
})
export class IdleWarningModalComponent {
  /** Whether the modal is visible */
  isVisible = input.required<boolean>();

  /** Remaining seconds from the token renewal service */
  remainingSeconds = input.required<number>();

  /** Emitted when user wants to keep the session active */
  onKeepSession = output<void>();

  /** Emitted when user wants to logout */
  onLogout = output<void>();

  /** Computed minutes from remaining seconds */
  minutes = computed(() => Math.floor(this.remainingSeconds() / 60));

  /** Computed seconds (remainder) from remaining seconds */
  seconds = computed(() => this.remainingSeconds() % 60);
}
