import { Component, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { ConfigService } from '../../services/config.service';
import { Config } from '../../models/config.models';

@Component({
  selector: 'dc-version-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatExpansionModule
  ],
  templateUrl: './version-selector.component.html',
  styleUrl: './version-selector.component.scss'
})
export class VersionSelectorComponent {
  private configService = inject(ConfigService);

  brandId = input.required<number>();
  configId = input.required<number>();
  configName = input.required<string>();
  selectedVersion = input<number | null>(null);
  activeVersion = input<number | undefined>(undefined);
  versions = input<Config[]>([]);

  versionSelected = output<number>();
  activeVersionSet = output<number>();
  notification = output<{ type: 'success' | 'error' | 'warning' | 'info'; message: string }>();

  isSettingActive = signal(false);
  previewVersion = signal<Config | null>(null);

  constructor() {
    // Set the first version as preview by default when versions change
    effect(() => {
      const versions = this.versions();
      this.previewVersion.set(versions.length > 0 ? versions[0] : null);
    });
  }


  onVersionChange(versionNumber: number): void {
    const version = this.versions().find(v => v.version === versionNumber);
    if (version) {
      this.previewVersion.set(version);
      this.versionSelected.emit(versionNumber);
    }
  }

  setActiveVersion(): void {
    const preview = this.previewVersion();
    if (!preview || this.isSettingActive()) return;

    this.isSettingActive.set(true);
    this.configService.setActiveVersion(this.brandId(), this.configName(), preview.version).subscribe({
      next: () => {
        this.activeVersionSet.emit(preview.version);
        this.notification.emit({ type: 'success', message: `Version ${preview.version} set as active` });
        this.isSettingActive.set(false);
      },
      error: () => {
        this.notification.emit({ type: 'error', message: 'Failed to set active version' });
        this.isSettingActive.set(false);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

