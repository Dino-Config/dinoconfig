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

  private loadConfigVersions(brandId: number, configId: number, selectVersion?: number): void {
    this.configService.getConfigVersions(brandId, configId).pipe(
      catchError((err: any) => {
        if (err.status === 403) {
          return of({ activeVersion: null, versions: [] });
        }
        return of({ activeVersion: null, versions: [] });
      })
    ).subscribe(response => {
      const { activeVersion, versions } = response;
      
      if (!Array.isArray(versions) || versions.length === 0) {
        this.configVersions.set([]);
        this.activeVersions.set({});
        this.isLoading.set(false);
        return;
      }
      
      const sortedVersions = [...versions].sort((a, b) => b.version - a.version);
      this.configVersions.set(sortedVersions);
      
      // Update active versions with the actual active version from response
      const activeVersionsData: Record<string, number> = {};
      if (activeVersion && activeVersion.name && activeVersion.version) {
        activeVersionsData[activeVersion.name] = activeVersion.version;
      }
      this.activeVersions.set(activeVersionsData);
      
      // Set the selected version if provided, otherwise use the active version or latest
      let versionToSelect: Config | null = null;
      
      if (selectVersion) {
        // Find the specific version to select
        versionToSelect = sortedVersions.find(v => v.version === selectVersion) || null;
      } else if (activeVersion && activeVersion.version) {
        // Use the active version if no specific version was requested
        versionToSelect = sortedVersions.find(v => v.version === activeVersion.version) || null;
      }
      
      // If no specific version found, use the latest
      if (!versionToSelect) {
        versionToSelect = sortedVersions[0];
      }
      
      this.selectedConfig.set(versionToSelect);
      this.formData.set(versionToSelect.formData || {});
      this.selectedVersion.set(versionToSelect.version);
      
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

    // Reload config versions and select the newly set active version
    const brandId = this.brandId();
    const configId = this.configId();
    if (brandId && configId) {
      // Pass the version that was just set as active so it gets selected
      this.loadConfigVersions(brandId, configId, version);
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

