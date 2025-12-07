import { Component, signal, effect, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserStateService } from '../../services/user-state.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'dc-email-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.scss'
})
export class EmailVerificationComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private userState = inject(UserStateService);
  private authService = inject(AuthService);

  user = this.userState.user;
  isResending = signal(false);
  resendSuccess = signal(false);
  resendError = signal<string | null>(null);
  isCheckingVerification = signal(false);
  autoCheckCount = signal(0);
  cooldownSeconds = signal(0);

  private cooldownInterval: ReturnType<typeof setInterval> | null = null;
  private autoCheckInterval: ReturnType<typeof setInterval> | null = null;
  private autoCheckTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.initializeCooldown();

    effect(() => {
      const user = this.user();
      if (user?.emailVerified) {
        this.router.navigate(['/brands'], { replaceUrl: true });
      }
    });
  }

  ngOnInit(): void {
    // User is loaded automatically by UserStateService preflight
    // Refresh to ensure we have the latest data
    this.userState.refreshUser();
    this.startCooldownTimer();
    this.startAutoCheck();
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
    if (this.autoCheckInterval) {
      clearInterval(this.autoCheckInterval);
    }
    if (this.autoCheckTimeout) {
      clearTimeout(this.autoCheckTimeout);
    }
  }

  private initializeCooldown(): void {
    const cooldownEndTime = localStorage.getItem('verificationEmailCooldown');
    if (cooldownEndTime) {
      const remainingMs = parseInt(cooldownEndTime) - Date.now();
      if (remainingMs > 0) {
        this.cooldownSeconds.set(Math.ceil(remainingMs / 1000));
      } else {
        localStorage.removeItem('verificationEmailCooldown');
        this.cooldownSeconds.set(0);
      }
    } else {
      this.cooldownSeconds.set(0);
    }
  }

  private startCooldownTimer(): void {
    this.cooldownInterval = setInterval(() => {
      const cooldownEndTime = localStorage.getItem('verificationEmailCooldown');
      if (cooldownEndTime) {
        const remainingMs = parseInt(cooldownEndTime) - Date.now();
        if (remainingMs > 0) {
          this.cooldownSeconds.set(Math.ceil(remainingMs / 1000));
        } else {
          localStorage.removeItem('verificationEmailCooldown');
          this.cooldownSeconds.set(0);
        }
      } else {
        this.cooldownSeconds.set(0);
      }
    }, 1000);
  }

  private startAutoCheck(): void {
    this.autoCheckTimeout = setTimeout(() => {
      this.checkVerificationStatus();
    }, 5000);

    this.autoCheckInterval = setInterval(() => {
      this.checkVerificationStatus();
    }, 10000);
  }

  private async checkVerificationStatus(): Promise<void> {
    try {
      await this.userState.refreshUser();
      this.autoCheckCount.update(count => count + 1);
    } catch (error) {
      console.error('Auto-check verification failed:', error);
    }
  }

  async handleResendEmail(): Promise<void> {
    const user = this.user();
    if (!user?.auth0Id) return;

    if (user.verificationEmailResendCount >= 3) {
      this.resendError.set('You have reached the maximum number of verification email attempts (3). Please contact support for assistance.');
      return;
    }

    const cooldownEndTime = localStorage.getItem('verificationEmailCooldown');
    if (cooldownEndTime) {
      const remainingMs = parseInt(cooldownEndTime) - Date.now();
      if (remainingMs > 0) {
        this.resendError.set(`Please wait ${Math.ceil(remainingMs / 1000)} seconds before requesting another email.`);
        return;
      }
    }

    this.isResending.set(true);
    this.resendError.set(null);
    this.resendSuccess.set(false);

    try {
      await firstValueFrom(
        this.authService.sendVerificationEmail(user.auth0Id)
      );
      this.resendSuccess.set(true);

      await this.userState.refreshUser();

      const newCooldownEndTime = Date.now() + (60 * 1000);
      localStorage.setItem('verificationEmailCooldown', newCooldownEndTime.toString());
      this.cooldownSeconds.set(60);

      setTimeout(() => this.resendSuccess.set(false), 5000);
    } catch (error: any) {
      console.error('Failed to resend verification email:', error);
      this.resendError.set(error.error?.message || 'Failed to resend verification email. Please try again.');
    } finally {
      this.isResending.set(false);
    }
  }

  async handleCheckVerification(): Promise<void> {
    this.isCheckingVerification.set(true);
    this.resendError.set(null);

    try {
      await this.userState.refreshUser();

      setTimeout(() => {
        const user = this.user();
        if (!user?.emailVerified) {
          this.resendError.set('Email not verified yet. Please check your email and click the verification link.');
        }
      }, 1000);
    } catch (error: any) {
      console.error('Failed to check verification status:', error);
      this.resendError.set(error.error?.message || 'Failed to check verification status. Please try again.');
    } finally {
      this.isCheckingVerification.set(false);
    }
  }

  async handleLogout(): Promise<void> {
    try {
      localStorage.clear();
      sessionStorage.clear();

      await firstValueFrom(this.authService.logout());

      window.location.href = environment.homeUrl;
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = environment.homeUrl;
    }
  }

  getRemainingResends(): number {
    const user = this.user();
    return 3 - (user?.verificationEmailResendCount ?? 0);
  }
}

