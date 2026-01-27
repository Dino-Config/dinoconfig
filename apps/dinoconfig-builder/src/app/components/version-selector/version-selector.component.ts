import { Component, input, output, signal, effect, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { ConfigService } from '../../services/config.service';
import { Config } from '../../models/config.models';

@Component({
  selector: 'dc-version-selector',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatExpansionModule
],
  templateUrl: './version-selector.component.html',
  styleUrl: './version-selector.component.scss'
})
export class VersionSelectorComponent {
  private configService = inject(ConfigService);

  brandId = input.required<number>();
  configName = input.required<string>();
  activeVersion = input<number | null>(null);
  versions = input<Config[]>([]);

  versionSelected = output<number>();
  activeVersionSet = output<number>();
  notification = output<{ type: 'success' | 'error' | 'warning' | 'info'; message: string }>();

  isSettingActive = signal(false);
  previewVersion = signal<Config | null>(null);

  constructor() {
    effect(() => {
      const versions = this.versions();
      const active = this.activeVersion();
      
      // Find active version or fall back to first/null
      const selected = versions.find(v => v.version === active) ?? versions[0] ?? null;
      this.previewVersion.set(selected);
    });
  }


  onVersionChange(versionNumber: number): void {
    const version = this.versions().find(v => v.version === versionNumber);
    if (!version) return;
    
    this.previewVersion.set(version);
    this.versionSelected.emit(versionNumber);
  }

  setActiveVersion(): void {
    const preview = this.previewVersion();
    if (!preview || this.isSettingActive()) return;

    this.isSettingActive.set(true);
    
    this.configService.setActiveVersion(this.brandId(), this.configName(), preview.version).subscribe({
      next: () => {
        this.activeVersionSet.emit(preview.version);
        this.notification.emit({ type: 'success', message: `Version ${preview.version} set as active` });
      },
      error: () => {
        this.notification.emit({ type: 'error', message: 'Failed to set active version' });
      },
      complete: () => this.isSettingActive.set(false)
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

  formatJson(data: any): string {
    if (!data || Object.keys(data).length === 0) {
      return '{}';
    }
    return JSON.stringify(data, null, 2);
  }
}

