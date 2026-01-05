import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ConfigService, ConfigVersionsResponse } from '../../services/config.service';
import { Config } from '../../models/config.models';
import { VersionSelectorComponent } from '../version-selector/version-selector.component';
import { ConfigBuilderPanelDragDropComponent } from '../config-builder-panel-dragdrop/config-builder-panel-dragdrop.component';
import { LimitViolationService } from '../../services/limit-violation.service';
import { NotificationService } from '../../services/notification.service';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'dc-config-view',
  standalone: true,
  imports: [
    CommonModule,
    VersionSelectorComponent,
    ConfigBuilderPanelDragDropComponent,
    SpinnerComponent
  ],
  templateUrl: './config-view.component.html',
  styleUrl: './config-view.component.scss'
})
export class ConfigViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private configService = inject(ConfigService);
  private limitViolationService = inject(LimitViolationService);
  private notificationService = inject(NotificationService);

  brandId = signal<number | null>(null);
  configId = signal<number | null>(null);
  selectedConfig = signal<Config | null>(null);
  configVersions = signal<Config[]>([]);
  activeVersion = signal<number | null>(null);
  formData = signal<Record<string, any>>({});
  isLoading = signal(true);
  error = signal<string | null>(null);

  canShowVersionSelector = computed(() => 
    this.limitViolationService.violations()?.features?.['config_versioning'] === true
  );

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
    this.isLoading.set(true);
    const emptyResponse: ConfigVersionsResponse = { activeVersion: null, versions: [] };
    
    this.configService.getConfigVersions(brandId, configId).pipe(
      catchError(() => of(emptyResponse))
    ).subscribe(({ activeVersion, versions }) => {
      if (!versions?.length) {
        this.configVersions.set([]);
        this.activeVersion.set(null);
        this.isLoading.set(false);
        return;
      }
      
      const sortedVersions = [...versions].sort((a, b) => b.version - a.version);
      this.configVersions.set(sortedVersions);
      this.activeVersion.set(activeVersion?.version ?? null);
      
      // Select version priority: explicit selection > active version > latest
      const versionToSelect = 
        sortedVersions.find(v => v.version === (selectVersion ?? activeVersion?.version)) 
        ?? sortedVersions[0];
      
      this.selectedConfig.set(versionToSelect);
      this.formData.set(versionToSelect.formData ?? {});
      this.isLoading.set(false);
    });
  }

  onVersionSelect(version: number): void {
    const versionConfig = this.configVersions().find(v => v.version === version);
    if (versionConfig) {
      this.selectedConfig.set(versionConfig);
      this.formData.set(versionConfig.formData ?? {});
    }
  }

  onActiveVersionSet(version: number): void {
    this.activeVersion.set(version);
    
    const brandId = this.brandId();
    const configId = this.configId();
    if (brandId && configId) {
      this.loadConfigVersions(brandId, configId, version);
    }
  }

  onFormDataChange(formData: Record<string, any>): void {
    this.formData.set(formData);
  }

  onConfigUpdated({ config, versions }: { config: Config; versions: Config[]; previousConfigId: number }): void {
    this.selectedConfig.set(config);
    this.formData.set(config.formData ?? {});
    this.configVersions.set(versions);
    this.activeVersion.set(config.version);
  }

  onNotification(notification: { type: 'success' | 'error' | 'warning' | 'info'; message: string }): void {
    this.notificationService.show(notification.message, notification.type);
  }
}

