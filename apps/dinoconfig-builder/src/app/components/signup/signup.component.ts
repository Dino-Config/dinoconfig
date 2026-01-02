import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthLayoutComponent } from '../shared/auth-layout/auth-layout.component';
import { ErrorMessages } from '../../constants/error-messages';

@Component({
  selector: 'dc-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals for component state
  isLoading = signal(false);
  error = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  signupForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    company: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    agreeToTerms: [false, [Validators.requiredTrue]]
  }, {
    validators: this.passwordMatchValidator
  });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (field.errors['requiredTrue'] && fieldName === 'agreeToTerms') {
      return 'You must agree to the terms to continue';
    }
    return '';
  }

  getPasswordMismatchError(): string {
    if (this.signupForm.errors?.['passwordMismatch'] && 
        this.signupForm.get('confirmPassword')?.touched) {
      return 'Passwords do not match';
    }
    return '';
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      // Mark all fields as touched to show errors
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.error.set('');
    this.isLoading.set(true);

    const { firstName, lastName, company, email, password } = this.signupForm.value;

    this.authService.signup({
      firstName,
      lastName,
      company,
      email,
      password
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/verify-email']);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        let errorMessage: string = ErrorMessages.AUTH.SIGNUP_FAILED;
        
        if (err.status === 0 || !err.status) {
          errorMessage = ErrorMessages.AUTH.CONNECTION_ERROR;
        }
        
        this.error.set(errorMessage);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(value => !value);
  }
}

