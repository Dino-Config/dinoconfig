import { Component, inject } from '@angular/core';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dc-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header">
        <div class="header-gradient"></div>
        <div class="header-content">
          <div class="icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h2 class="dialog-title">Confirm Action</h2>
        </div>
      </div>
      <div class="dialog-content">
        <p class="dialog-message">{{ data.message }}</p>
      </div>
      <div class="dialog-actions">
        <button class="btn btn-cancel" (click)="onCancel()">Cancel</button>
        <button class="btn btn-confirm" (click)="onConfirm()">Confirm</button>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-dialog-container {
      padding: 0 !important;
      border-radius: 24px !important;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
    }

    .confirm-dialog {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      position: relative;
      overflow: hidden;
      min-width: 400px;
      max-width: 500px;
    }

    .dialog-header {
      position: relative;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      padding: 24px 32px;
      border-bottom: 2px solid #e5e7eb;
    }

    .header-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);
      background-size: 200% 100%;
      animation: gradientShift 8s ease infinite;
    }

    @keyframes gradientShift {
      0%, 100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
      z-index: 1;
    }

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      color: #f59e0b;
      flex-shrink: 0;
    }

    .dialog-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .dialog-content {
      padding: 32px;
      background: linear-gradient(135deg, #f0f4f8 0%, #f7f9fc 50%, #fafbfd 100%);
      position: relative;
    }

    .dialog-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
      pointer-events: none;
    }

    .dialog-message {
      margin: 0;
      font-size: 15px;
      line-height: 1.6;
      color: #374151;
      position: relative;
      z-index: 1;
    }

    .dialog-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 32px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-top: 1px solid #e5e7eb;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: inherit;
      min-width: 100px;
    }

    .btn:active {
      transform: scale(0.98);
    }

    .btn-cancel {
      background: white;
      color: #374151;
      border: 2px solid #e5e7eb;
    }

    .btn-cancel:hover {
      border-color: #3b82f6;
      color: #3b82f6;
      background: #f0f9ff;
    }

    .btn-confirm {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
    }

    .btn-confirm:hover {
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
      transform: translateY(-1px);
    }

    @media (max-width: 480px) {
      .confirm-dialog {
        min-width: auto;
        max-width: 90vw;
      }

      .dialog-header,
      .dialog-content,
      .dialog-actions {
        padding: 20px;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  data = inject<{ message: string }>(MAT_DIALOG_DATA);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

