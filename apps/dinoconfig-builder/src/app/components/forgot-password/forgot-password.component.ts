import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthLayoutComponent } from '../shared/auth-layout/auth-layout.component';
import { ErrorMessages } from '../../constants/error-messages';

@Component({
  selector: 'dc-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Signals for component state
  isLoading = signal(false);
  error = signal('');
  successMessage = signal('');

  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.error.set('');
    this.successMessage.set('');
    this.isLoading.set(true);

    const { email } = this.forgotPasswordForm.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Password reset email sent. Please check your inbox.');
      },
      error: (err: any) => {
        this.isLoading.set(false);
        let errorMessage: string = ErrorMessages.AUTH.FORGOT_PASSWORD_FAILED;
        
        if (err.status === 0 || !err.status) {
          errorMessage = ErrorMessages.AUTH.CONNECTION_ERROR;
        }
        
        this.error.set(errorMessage);
      }
    });
  }
}

