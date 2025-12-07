import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from '../../services/config.service';
import { BrandService } from '../../services/brand.service';
import { Config } from '../../models/config.models';
import { Brand } from '../../models/user.models';
import { BrandHeaderComponent } from '../brand-header/brand-header.component';
import { ConfigSidebarComponent } from '../config-sidebar/config-sidebar.component';
import { VersionSelectorComponent } from '../version-selector/version-selector.component';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { SubscriptionLimitWarningComponent } from '../shared/subscription-limit-warning/subscription-limit-warning.component';
import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionStatus } from '../../models/subscription.models';
import { catchError, of } from 'rxjs';
import { ConfigBuilderPanelDragDropComponent } from '../config-builder-panel-dragdrop/config-builder-panel-dragdrop.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { InputDialogComponent } from '../shared/input-dialog/input-dialog.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'dc-builder',
  standalone: true,
  imports: [
    CommonModule,
    BrandHeaderComponent,
    ConfigSidebarComponent,
    VersionSelectorComponent,
    SpinnerComponent,
    SubscriptionLimitWarningComponent,
    ConfigBuilderPanelDragDropComponent
  ],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.scss'
})
export class BuilderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private configService = inject(ConfigService);
  private brandService = inject(BrandService);
  private subscriptionService = inject(SubscriptionService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  brand = signal<Brand | null>(null);
  configs = signal<Config[]>([]);
  selectedId = signal<number | null>(null);
  selectedConfig = signal<Config | null>(null);
  selectedVersion = signal<number | null>(null);
  configVersions = signal<Config[]>([]);
  activeVersions = signal<Record<string, number>>({});
  isLoading = signal(true);
  error = signal<string | null>(null);
  subscription = signal<SubscriptionStatus | null>(null);
  limitReached = signal(false);
  limitErrorMessage = signal<string>('');
  formData = signal<Record<string, any>>({});

  brandId = signal<number | null>(null);

  constructor() {
    effect(() => {
      const id = this.brandId();
      if (id) {
        this.loadBrandAndConfigs(id);
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const brandId = params['brandId'] ? parseInt(params['brandId']) : null;
      if (brandId) {
        this.setLastBrandId(brandId);
        this.brandId.set(brandId);
      } else {
        const lastBrandId = this.getLastBrandId();
        if (lastBrandId) {
          this.router.navigate(['/brands', lastBrandId, 'builder']);
        } else {
          this.router.navigate(['/brands']);
        }
      }
    });

    this.loadSubscription();
  }

  private setLastBrandId(brandId: number): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastBrandId', String(brandId));
      }
    } catch (_) {
      // Ignore localStorage errors
    }
  }

  private getLastBrandId(): string | null {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('lastBrandId') : null;
    } catch (_) {
      return null;
    }
  }

  private loadSubscription(): void {
    this.subscriptionService.getSubscriptionWithViolations().pipe(
      catchError(() => of(null))
    ).subscribe(data => {
      if (data) {
        this.subscription.set({
          tier: data.tier,
          status: data.status,
          limits: data.limits,
          features: data.features,
          currentPeriodEnd: data.currentPeriodEnd,
          isActive: data.isActive
        });
      }
    });
  }

  private loadBrandAndConfigs(brandId: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.brandService.getBrand(brandId).pipe(
      catchError((err: any) => {
        this.error.set(err.message || 'Failed to load brand');
        return of(null);
      })
    ).subscribe(brandData => {
      if (brandData) {
        this.brand.set(brandData);
      }
    });

    this.configService.getConfigDefinitions(brandId).pipe(
      catchError((err: any) => {
        this.error.set(err.message || 'Failed to load configs');
        return of([]);
      })
    ).subscribe(configsData => {
      this.configs.set(configsData);

      this.activeVersions.set(this.extractActiveVersions(configsData));
      this.isLoading.set(false);
    });
  }

  onConfigSelect(id: number | null): void {
    this.selectedId.set(id);
    const config = id ? this.configs().find(c => c.id === id) || null : null;
    this.selectedConfig.set(config);
    
    if (id && config) {
      this.formData.set(config.formData || {});
      this.loadConfigVersions(id);
    } else {
      this.configVersions.set([]);
      this.selectedVersion.set(null);
      this.formData.set({});
    }
  }

  private loadConfigVersions(configId: number): void {
    const brandId = this.brandId();
    if (!brandId) return;

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
        return;
      }
      
      const sortedVersions = [...versions].sort((a, b) => b.version - a.version);
      this.configVersions.set(sortedVersions);
      
      if (sortedVersions.length > 0) {
        this.selectedVersion.set(sortedVersions[0].version);
      }
    });
  }

  onVersionSelect(version: number): void {
    this.selectedVersion.set(version);
  }

  onConfigCreate(name: string): void {
    const brandId = this.brandId();
    if (!name.trim() || !brandId) return;

    this.configService.createConfig(brandId, { name }).pipe(
      catchError((err: any) => {
        const errorMessage = err.error?.message || err.message || 'Failed to create config';
        this.limitErrorMessage.set(errorMessage);

        if (err.status === 403 && errorMessage.includes('maximum number of configs')) {
          this.limitReached.set(true);
        }
        
        this.notificationService.show(errorMessage, 'error');
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        this.configs.set([...this.configs(), response]);
        this.selectedId.set(response.id);
        this.selectedConfig.set(response);
        this.limitReached.set(false);
        this.limitErrorMessage.set('');
        this.notificationService.show(`Configuration "${name}" created successfully`, 'success');
      }
    });
  }

  onConfigDelete(id: number): void {
    const brandId = this.brandId();
    if (!brandId) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this configuration? This action cannot be undone.' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const configName = this.configs().find(c => c.id === id)?.name || 'Configuration';
        this.configService.deleteConfig(brandId, id).pipe(
          catchError((err: any) => {
            const errorMessage = err.error?.message || err.message || 'Failed to delete configuration';
            this.notificationService.show(errorMessage, 'error');
            return of(null);
          })
        ).subscribe(() => {
          this.configs.set(this.configs().filter(c => c.id !== id));
          if (this.selectedId() === id) {
            this.selectedId.set(null);
            this.selectedConfig.set(null);
          }
          this.notificationService.show(`Configuration "${configName}" deleted successfully`, 'success');
        });
      }
    });
  }

  onConfigRename(id: number): void {
    const config = this.configs().find(c => c.id === id);
    if (!config) return;

    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: {
        title: 'Rename Configuration',
        label: 'Configuration Name',
        defaultValue: config.name
      }
    });

    dialogRef.afterClosed().subscribe(newName => {
      if (!newName || newName.trim() === '') return;

      const brandId = this.brandId();
      if (!brandId) return;

      this.configService.updateConfigName(brandId, id, newName.trim()).pipe(
        catchError((err: any) => {
          const errorMessage = err.error?.message || err.message || 'Failed to rename configuration';
          this.notificationService.show(errorMessage, 'error');
          return of(null);
        })
      ).subscribe(updatedConfig => {
        if (updatedConfig) {
          this.configs.set(this.configs().map(c => c.id === id ? updatedConfig : c));
          if (this.selectedId() === id) {
            this.selectedConfig.set(updatedConfig);
          }
          this.notificationService.show(`Configuration renamed to "${newName.trim()}" successfully`, 'success');
        }
      });
    });
  }

  onActiveVersionSet(version: number): void {
    const selected = this.selectedConfig();
    if (!selected) return;

    this.activeVersions.update(prev => ({
      ...prev,
      [selected.name]: version
    }));

    // Reload configs to get updated active versions
    const brandId = this.brandId();
    if (brandId) {
      this.configService.getConfigDefinitions(brandId).pipe(
        catchError(() => of([]))
      ).subscribe(configs => {
        this.configs.set(configs);
        this.activeVersions.set(this.extractActiveVersions(configs));
      });
    }
  }

  private extractActiveVersions(configs: Config[]): Record<string, number> {
    const activeVersionsData: Record<string, number> = {};
    for (const config of configs) {
      if (config.name && config.version) {
        activeVersionsData[config.name] = config.version;
      }
    }
    return activeVersionsData;
  }

  onNotification(notification: { type: 'success' | 'error' | 'warning' | 'info'; message: string }): void {
    this.notificationService.show(notification.message, notification.type);
  }

  onFormDataChange(formData: Record<string, any>): void {
    this.formData.set(formData);
  }

  onConfigUpdated(data: { config: Config; versions: Config[]; previousConfigId: number }): void {
    // Update the config in the list
    const updatedConfigs = this.configs().map(c => 
      c.id === data.config.id ? data.config : c
    );
    this.configs.set(updatedConfigs);
    
    // Update selected config if it's the one that was updated
    if (this.selectedConfig()?.id === data.config.id) {
      this.selectedConfig.set(data.config);
      this.formData.set(data.config.formData || {});
    }
    
    // Update versions
    this.configVersions.set(data.versions);
  }

  goToBrands(): void {
    this.router.navigate(['/brands']);
  }
}

