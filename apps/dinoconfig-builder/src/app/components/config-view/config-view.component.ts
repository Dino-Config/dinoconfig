import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ConfigService } from '../../services/config.service';
import { Config } from '../../models/config.models';
import { VersionSelectorComponent } from '../version-selector/version-selector.component';
import { ConfigBuilderPanelDragDropComponent } from '../config-builder-panel-dragdrop/config-builder-panel-dragdrop.component';
import { LimitViolationService } from '../../services/limit-violation.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'dc-config-view',
  standalone: true,
  imports: [
    CommonModule,
    VersionSelectorComponent,
    ConfigBuilderPanelDragDropComponent
  ],
  templateUrl: './config-view.component.html',
  styleUrl: './config-view.component.scss'
})
export class ConfigViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private configService = inject(ConfigService);
  private limitViolationService = inject(LimitViolationService);

  brandId = signal<number | null>(null);
  configId = signal<number | null>(null);
  selectedConfig = signal<Config | null>(null);
  selectedVersion = signal<number | null>(null);
  configVersions = signal<Config[]>([]);
  activeVersions = signal<Record<string, number>>({});
  formData = signal<Record<string, any>>({});
  isLoading = signal(true);
  error = signal<string | null>(null);

  canShowVersionSelector = computed(() => {
    const violations = this.limitViolationService.violations();
    if (!violations) return false;
    
    return violations.features?.['config_versioning'] === true;
  });

  constructor() {
    effect(() => {
      const brandId = this.brandId();
      const configId = this.configId();
      if (brandId && configId) {
        this.loadConfigVersions(brandId, configId);
      }
    });
  }

  ngOnInit(): void {
    // Get configId from current route
    this.route.params.subscribe(params => {
      const configId = params['configId'] ? parseInt(params['configId']) : null;
      if (configId) {
        this.configId.set(configId);
      } else {
        this.error.set('Invalid route parameters');
        this.isLoading.set(false);
      }
    });

    // Get brandId from parent route (builder route)
    this.route.parent?.params.subscribe(params => {
      const brandId = params['brandId'] ? parseInt(params['brandId']) : null;
      if (brandId) {
        this.brandId.set(brandId);
      } else {
        this.error.set('Brand ID not found in route');
        this.isLoading.set(false);
      }
    });
  }

  private loadConfigVersions(brandId: number, configId: number): void {
    this.configService.getConfigVersions(brandId, configId).pipe(
      catchError((err: any) => {
        if (err.status === 403) {
          this.configVersions.set([]);
          return of([]);
        }
        return of([]);
      })
    ).subscribe(versions => {
      if (!Array.isArray(versions)) {
        this.configVersions.set([]);
        this.isLoading.set(false);
        return;
      }
      
      const sortedVersions = [...versions].sort((a, b) => b.version - a.version);
      this.configVersions.set(sortedVersions);
      
      // Extract active versions
      const activeVersionsData: Record<string, number> = {};
      for (const version of sortedVersions) {
        if (version.name && version.version) {
          activeVersionsData[version.name] = version.version;
        }
      }
      this.activeVersions.set(activeVersionsData);
      
      // Set the latest version as selected config
      if (sortedVersions.length > 0) {
        const latestVersion = sortedVersions[0];
        this.selectedConfig.set(latestVersion);
        this.formData.set(latestVersion.formData || {});
        if (!this.selectedVersion()) {
          this.selectedVersion.set(latestVersion.version);
        }
      }
      
      this.isLoading.set(false);
    });
  }

  onVersionSelect(version: number): void {
    this.selectedVersion.set(version);
    const versionConfig = this.configVersions().find(v => v.version === version);
    if (versionConfig) {
      this.selectedConfig.set(versionConfig);
      this.formData.set(versionConfig.formData || {});
    }
  }

  onActiveVersionSet(version: number): void {
    const selected = this.selectedConfig();
    if (!selected) return;

    this.activeVersions.update(prev => ({
      ...prev,
      [selected.name]: version
    }));

    // Reload config versions
    const brandId = this.brandId();
    const configId = this.configId();
    if (brandId && configId) {
      this.loadConfigVersions(brandId, configId);
    }
  }

  onFormDataChange(formData: Record<string, any>): void {
    this.formData.set(formData);
  }

  onConfigUpdated(data: { config: Config; versions: Config[]; previousConfigId: number }): void {
    this.selectedConfig.set(data.config);
    this.formData.set(data.config.formData || {});
    this.configVersions.set(data.versions);
  }

  onNotification(notification: { type: 'success' | 'error' | 'warning' | 'info'; message: string }): void {
    // TODO: Implement notification service if needed
    console.log('Notification:', notification);
  }
}

