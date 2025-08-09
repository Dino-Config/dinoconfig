import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-signup-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './signup-dialog.component.html',
  styleUrls: ['./signup-dialog.component.scss']
})
export class SignupDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<SignupDialogComponent>);

  signupForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor() {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
      marketingEmails: [false]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.getCurrentUser()) {
      this.dialogRef.close();
    }
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      
      const userData = {
        firstName: this.signupForm.value.firstName,
        lastName: this.signupForm.value.lastName,
        email: this.signupForm.value.email,
        password: this.signupForm.value.password
      };

      this.authService.signup(userData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Account created successfully! Welcome to DinoConfig!', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.dialogRef.close();
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = 'Signup failed. Please try again.';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 409) {
            errorMessage = 'An account with this email already exists.';
          } else if (error.status === 0) {
            errorMessage = 'Unable to connect to server. Please check your connection.';
          }
          
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    
    if (fieldName === 'email' && field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (fieldName === 'password' && field?.hasError('minlength')) {
      return 'Password must be at least 8 characters long';
    }
    
    if (fieldName === 'firstName' && field?.hasError('minlength')) {
      return 'First name must be at least 2 characters long';
    }
    
    if (fieldName === 'lastName' && field?.hasError('minlength')) {
      return 'Last name must be at least 2 characters long';
    }
    
    if (fieldName === 'confirmPassword' && this.signupForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    
    if (fieldName === 'acceptTerms' && field?.hasError('required')) {
      return 'You must accept the terms and conditions';
    }
    
    return '';
  }

  openLoginDialog(): void {
    this.dialogRef.close('login');
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }
} 