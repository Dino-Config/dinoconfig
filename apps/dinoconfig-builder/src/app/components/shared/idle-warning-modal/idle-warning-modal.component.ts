import { Component, input, output, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dc-idle-warning-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './idle-warning-modal.component.html',
  styleUrl: './idle-warning-modal.component.scss'
})
export class IdleWarningModalComponent {
  isVisible = input.required<boolean>();
  remainingSeconds = input.required<number>();
  onKeepSession = output<void>();
  onLogout = output<void>();

  countdown = signal<number>(0);
  minutes = computed(() => Math.floor(this.countdown() / 60));
  seconds = computed(() => this.countdown() % 60);

  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const remaining = this.remainingSeconds();
      this.countdown.set(remaining);
    });

    effect(() => {
      const visible = this.isVisible();
      const countdown = this.countdown();

      if (visible && countdown > 0) {
        this.startCountdown();
      } else {
        this.stopCountdown();
      }
    });
  }

  private startCountdown(): void {
    this.stopCountdown();
    
    this.countdownInterval = setInterval(() => {
      this.countdown.update(value => {
        if (value <= 1) {
          this.stopCountdown();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }
}

