import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfigService } from '../../services/config.service';
import { BrandService } from '../../services/brand.service';
import { Config } from '../../models/config.models';
import { Brand } from '../../models/user.models';
import { BrandHeaderComponent } from '../brand-header/brand-header.component';
import { ConfigSidebarComponent } from '../config-sidebar/config-sidebar.component';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { SubscriptionLimitWarningComponent } from '../shared/subscription-limit-warning/subscription-limit-warning.component';
import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionStatus } from '../../models/subscription.models';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'dc-builder',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BrandHeaderComponent,
    ConfigSidebarComponent,
    SpinnerComponent,
    SubscriptionLimitWarningComponent
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

  brand = signal<Brand | null>(null);
  configs = signal<Config[]>([]);
  selectedId = signal<number | null>(null);
  activeVersions = signal<Record<string, number>>({});
  isLoading = signal(true);
  error = signal<string | null>(null);
  subscription = signal<SubscriptionStatus | null>(null);
  limitReached = signal(false);
  limitErrorMessage = signal<string>('');

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

    // Listen to child route params for configId to sync sidebar selection
    this.route.firstChild?.params.subscribe(params => {
      const configId = params['configId'] ? parseInt(params['configId']) : null;
      if (configId && this.selectedId() !== configId) {
        this.selectedId.set(configId);
      } else if (!configId) {
        this.selectedId.set(null);
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
    const brandId = this.brandId();
    if (!brandId) return;
    this.selectedId.set(id);

    if (id) {
      // Navigate to config route
      this.router.navigate(['/brands', brandId, 'builder', 'configs', id]);
    } else {
      // Navigate to builder without config
      this.router.navigate(['/brands', brandId, 'builder']);
    }
  }


  onConfigCreate(name: string): void {
    const brandId = this.brandId();
    if (!name.trim() || !brandId) return;

    this.configService.createConfig(brandId, { name }).pipe(
      catchError((err: any) => {
        const errorMessage = err.error?.message || err.message || 'Failed to create config';
        this.limitErrorMessage.set(errorMessage);

        // Check if it's a subscription limit error
        if (err.status === 403 && errorMessage.includes('maximum number of configs')) {
          this.limitReached.set(true);
        }
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        this.configs.set([...this.configs(), response]);
        this.limitReached.set(false);
        this.limitErrorMessage.set('');
        // Navigate to the new config
        this.router.navigate(['/brands', brandId, 'builder', 'configs', response.id]);
      }
    });
  }

  onConfigDelete(id: number): void {
    const brandId = this.brandId();
    if (!brandId) return;

    if (!confirm('Are you sure you want to delete this configuration? This action cannot be undone.')) {
      return;
    }

    this.configService.deleteConfig(brandId, id).pipe(
      catchError((err: any) => {
        console.error('Failed to delete config:', err);
        return of(null);
      })
    ).subscribe(() => {
      this.configs.set(this.configs().filter(c => c.id !== id));
      // If deleted config was selected, navigate back to builder
      if (this.selectedId() === id) {
        this.router.navigate(['/brands', brandId, 'builder']);
      }
    });
  }

  onConfigRename(id: number): void {
    const config = this.configs().find(c => c.id === id);
    if (!config) return;

    const newName = prompt('Enter new config name:', config.name);
    if (!newName || newName.trim() === '') return;

    const brandId = this.brandId();
    if (!brandId) return;

    this.configService.updateConfigName(brandId, id, newName.trim()).pipe(
      catchError((err: any) => {
        console.error('Failed to rename config:', err);
        return of(null);
      })
    ).subscribe(updatedConfig => {
      if (updatedConfig) {
        this.configs.set(this.configs().map(c => c.id === id ? updatedConfig : c));
        // Reload configs to get updated active versions
        this.configService.getConfigDefinitions(brandId).pipe(
          catchError(() => of([]))
        ).subscribe(configs => {
          this.configs.set(configs);
          this.activeVersions.set(this.extractActiveVersions(configs));
        });
      }
    });
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

  onConfigUpdated(data: { config: Config; versions: Config[]; previousConfigId: number }): void {
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

  goToBrands(): void {
    this.router.navigate(['/brands']);
  }
}

