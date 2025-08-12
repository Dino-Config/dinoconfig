import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ForgotPasswordRequest } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './forgot-password-dialog.component.html',
  styleUrls: ['./forgot-password-dialog.component.scss']
})
export class ForgotPasswordDialogComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  closeDialog() {
    // TODO: Hook into your dialog close logic
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('forgot-dialog-backdrop')) {
      this.closeDialog();
    }
  }

  getErrorMessage(field: string): string {
    if (this.forgotForm.get(field)?.hasError('required')) return 'This field is required';
    if (this.forgotForm.get(field)?.hasError('email')) return 'Invalid email address';
    return '';
  }

  submit() {
    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const request: ForgotPasswordRequest = {
      email: this.forgotForm.value.email!
    };

    this.authService.forgotPassword(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Password reset email sent. Please check your inbox.';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Failed to send password reset email.';
      }
    });
  }
}