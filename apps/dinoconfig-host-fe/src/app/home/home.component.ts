import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DialogService } from '../dialogs/dialog.service';
import { AuthService } from '../auth/services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSlideToggleModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private authService = inject(AuthService);

  // Typing animation properties
  featureFlagsText = '';
  apiSettingsText = '';
  userPreferencesText = '';

  // Toggle states
  featureFlagsToggleActive = false;
  apiSettingsToggleActive = false;
  userPreferencesToggleActive = false;

  private timers: number[] = [];
  private intervals: number[] = [];
  private isAnimationActive = false;
  private animationId: number | null = null;

  // Animation sequences
  private readonly featureFlagsSequence = [
    { text: 'Feature Flags', delay: 0 },
    { text: 'isFeatureEnabled', delay: 4000 },
    { text: 'isCountryEnabled', delay: 8000 }
  ];

  private readonly apiSettingsSequence = [
    { text: 'API Settings', delay: 2000 },
    { text: 'api_settings', delay: 6000 },
    { text: 'sdk_settings', delay: 10000 }
  ];

  private readonly userPreferencesSequence = [
    { text: 'User Preferences', delay: 1000 },
    { text: 'user_preferences', delay: 5000 },
    { text: 'user_settings', delay: 9000 }
  ];

  ngOnInit() {
    console.log('HomeComponent ngOnInit - Resetting animation');
    this.resetAnimation();
    
    // Small delay to ensure everything is properly reset
    this.addTimer(() => {
      this.startTypingAnimation();
    }, 200);
  }

  ngOnDestroy() {
    console.log('HomeComponent ngOnDestroy - Cleaning up animation');
    this.cleanupAnimation();
  }

  private resetAnimation() {
    console.log('Resetting animation - clearing all timers and intervals');
    // Clear any existing timers
    this.clearAllTimers();
    
    // Cancel any running animation frame
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Reset text and toggle states
    this.featureFlagsText = '';
    this.apiSettingsText = '';
    this.userPreferencesText = '';
    this.featureFlagsToggleActive = false;
    this.apiSettingsToggleActive = false;
    this.userPreferencesToggleActive = false;
    this.isAnimationActive = false;
  }

  private clearAllTimers() {
    console.log(`Clearing ${this.timers.length} timers and ${this.intervals.length} intervals`);
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }

  private cleanupAnimation() {
    this.isAnimationActive = false;
    this.clearAllTimers();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }


  private addTimer(callback: () => void, delay: number): number {
    const timer = setTimeout(callback, delay);
    this.timers.push(timer);
    return timer;
  }

  private startTypingAnimation() {
    console.log('Starting typing animation');
    this.isAnimationActive = true;
    
    // Start with initial texts
    this.addTimer(() => this.typeText('Feature Flags', 'featureFlagsText'), 500);
    this.addTimer(() => this.typeText('API Settings', 'apiSettingsText'), 1000);
    this.addTimer(() => this.typeText('User Preferences', 'userPreferencesText'), 1500);

    // First transition after 3 seconds
    this.addTimer(() => {
      this.eraseAndType('isFeatureEnabled', 'featureFlagsText');
    }, 3000);

    this.addTimer(() => {
      this.eraseAndType('api_settings', 'apiSettingsText');
    }, 4000);

    this.addTimer(() => {
      this.eraseAndType('user_preferences', 'userPreferencesText');
    }, 5000);

    // Second transition after 7 seconds
    this.addTimer(() => {
      this.eraseAndType('isCountryEnabled', 'featureFlagsText');
    }, 7000);

    this.addTimer(() => {
      this.eraseAndType('sdk_settings', 'apiSettingsText');
    }, 8000);

    this.addTimer(() => {
      this.eraseAndType('user_settings', 'userPreferencesText');
    }, 9000);

    // Loop back after 12 seconds
    this.addTimer(() => {
      this.startTypingAnimation();
    }, 12000);
  }

  private typeText(targetText: string, property: string) {
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex < targetText.length) {
        (this as any)[property] = targetText.substring(0, currentIndex + 1);
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        // Remove from intervals array
        const index = this.intervals.indexOf(typeInterval);
        if (index > -1) {
          this.intervals.splice(index, 1);
        }
        // Turn on toggle when typing is complete
        this.setToggleActive(property, true);
      }
    }, 80); // Typing speed
    
    this.intervals.push(typeInterval);
  }

  private eraseAndType(newText: string, property: string) {
    const currentText = this[property as keyof this] as string;
    let currentIndex = currentText.length;
    
    // Turn off toggle when starting to erase
    this.setToggleActive(property, false);
    
    // First erase the current text
    const eraseInterval = setInterval(() => {
      if (currentIndex > 0) {
        (this as any)[property] = currentText.substring(0, currentIndex - 1);
        currentIndex--;
      } else {
        clearInterval(eraseInterval);
        // Remove from intervals array
        const index = this.intervals.indexOf(eraseInterval);
        if (index > -1) {
          this.intervals.splice(index, 1);
        }
        // Then type the new text
        this.typeText(newText, property);
      }
    }, 50); // Erasing speed (faster than typing)
    
    this.intervals.push(eraseInterval);
  }

  private setToggleActive(property: string, active: boolean) {
    switch (property) {
      case 'featureFlagsText':
        this.featureFlagsToggleActive = active;
        break;
      case 'apiSettingsText':
        this.apiSettingsToggleActive = active;
        break;
      case 'userPreferencesText':
        this.userPreferencesToggleActive = active;
        break;
    }
  }

  openSignupDialog() {
    if (this.authService.isAuthenticated()) {
      window.open(environment.builderUrl, '_blank');
    } else {
      this.dialogService.openSignupDialog();
    }
  }

  openCalendlyDialog() {
    this.dialogService.openCalendlyDialog();
  }
}
