import { Component, inject } from '@angular/core';

import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'dc-notification',
  standalone: true,
  imports: [],
  template: `
    <div class="notification-container">
      @for (notification of notifications(); track notification.id) {
        <div class="notification notification--{{ notification.type }}" [attr.data-id]="notification.id">
          <div class="notification__content">
            <div class="notification__icon">
              @if (notification.type === 'success') {
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#10b981"/>
                  <path d="M6 10l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              } @else if (notification.type === 'error') {
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#ef4444"/>
                  <path d="M6 6l8 8M14 6l-8 8" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
              } @else if (notification.type === 'warning') {
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#f59e0b"/>
                  <path d="M10 6v4M10 14h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
              } @else {
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#3b82f6"/>
                  <path d="M10 6v4M10 14h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
              }
            </div>
            <div class="notification__message">{{ notification.message }}</div>
            <button class="notification__close" (click)="onClose(notification.id)" aria-label="Close notification">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1001;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }

    .notification {
      max-width: 400px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      pointer-events: auto;
      border: 1px solid rgba(255, 255, 255, 0.2);

      &--success {
        background: #10b981;
        color: white;
      }

      &--error {
        background: #ef4444;
        color: white;
      }

      &--warning {
        background: #f59e0b;
        color: white;
      }

      &--info {
        background: #3b82f6;
        color: white;
      }

      &__content {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        gap: 12px;
      }

      &__icon {
        flex-shrink: 0;
      }

      &__message {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.5;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      &__close {
        flex-shrink: 0;
        background: none;
        border: none;
        color: currentColor;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        &:focus {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 2px;
        }
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 480px) {
      .notification-container {
        top: 10px;
        right: 10px;
        left: 10px;
      }

      .notification {
        max-width: none;

        &__content {
          padding: 12px 16px;
        }

        &__message {
          font-size: 13px;
        }
      }
    }
  `]
})
export class NotificationComponent {
  private notificationService = inject(NotificationService);
  notifications = this.notificationService.notifications;

  onClose(id: string): void {
    this.notificationService.remove(id);
  }
}

