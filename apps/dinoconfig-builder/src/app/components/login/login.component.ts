import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatError } from '@angular/material/form-field';
import { AuthService } from '../../services/auth.service';
import { AuthLayoutComponent } from '../shared/auth-layout/auth-layout.component';

@Component({
  selector: 'dc-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatError,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals for component state
  isLoading = signal(false);
  error = signal('');
  showPassword = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.error.set('');
    this.isLoading.set(true);

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/brands']);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        let errorMessage = 'Login failed. Please try again.';
        
        if (err.status === 404 && err.error?.message?.includes('User not found in database')) {
          errorMessage = 'Your account exists but is not properly set up in our system. Please contact support or try signing up again.';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (err.status === 0 || !err.status) {
          errorMessage = 'Unable to connect to server. Please check your connection.';
        }
        
        this.error.set(errorMessage);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }
}

