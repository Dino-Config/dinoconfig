import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ConfigService } from '../../services/config.service';
import { Config } from '../../models/config.models';

@Component({
  selector: 'dc-active-version-container',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './active-version-container.component.html',
  styleUrl: './active-version-container.component.scss'
})
export class ActiveVersionContainerComponent {
  private configService = inject(ConfigService);

  brandId = input.required<number>();
  configId = input.required<number>();
  configName = input.required<string>();
  activeVersion = input<number | undefined>(undefined);

  versionChanged = output<number>();

  isSettingActive = signal(false);

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async setActiveVersion(version: number): Promise<void> {
    if (this.isSettingActive()) return;

    try {
      this.isSettingActive.set(true);
      await this.configService.setActiveVersion(this.brandId(), this.configName(), version).toPromise();
      this.versionChanged.emit(version);
    } catch (error: any) {
      console.error('Error setting active version:', error);
    } finally {
      this.isSettingActive.set(false);
    }
  }
}

