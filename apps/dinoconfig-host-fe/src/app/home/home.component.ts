import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DialogService } from '../dialogs/dialog.service';
import { TypewriterService } from './services/typewriter.service';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSlideToggleModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private dialogService = inject(DialogService);
  private typewriterService = inject(TypewriterService);

  // Titles for each typing animation
  private featureFlagsTitles = ['Feature Flags', 'isFeatureEnabled', 'isCountryEnabled'];
  private apiSettingsTitles = ['API Settings', 'api_settings', 'sdk_settings'];
  private userPreferencesTitles = ['User Preferences', 'user_preferences', 'user_settings'];

  // Observables for typed text
  featureFlagsText$: Observable<string>;
  apiSettingsText$: Observable<string>;
  userPreferencesText$: Observable<string>;

  // Toggle states - will be set based on animation state
  featureFlagsToggleActive = false;
  apiSettingsToggleActive = false;
  userPreferencesToggleActive = false;

  constructor() {
    // Create observables for each typing animation
    this.featureFlagsText$ = this.typewriterService
      .getTypewriterEffect(this.featureFlagsTitles)
      .pipe(map((text) => {
        this.updateToggle('featureFlags', text, this.featureFlagsTitles);
        return text;
      }));

    this.apiSettingsText$ = this.typewriterService
      .getTypewriterEffect(this.apiSettingsTitles)
      .pipe(map((text) => {
        this.updateToggle('apiSettings', text, this.apiSettingsTitles);
        return text;
      }));

    this.userPreferencesText$ = this.typewriterService
      .getTypewriterEffect(this.userPreferencesTitles)
      .pipe(map((text) => {
        this.updateToggle('userPreferences', text, this.userPreferencesTitles);
        return text;
      }));
  }

  private updateToggle(type: string, currentText: string, titles: string[]) {
    // Toggle is active when text is fully typed and matches any of the full titles
    const isActive = titles.some(title => currentText === title && currentText.length > 0);
    
    switch (type) {
      case 'featureFlags':
        this.featureFlagsToggleActive = isActive;
        break;
      case 'apiSettings':
        this.apiSettingsToggleActive = isActive;
        break;
      case 'userPreferences':
        this.userPreferencesToggleActive = isActive;
        break;
    }
  }

  openSignupDialog() {
    window.location.href = `${environment.builderUrl}/signup`;
  }

  openCalendlyDialog() {
    this.dialogService.openCalendlyDialog();
  }
}
