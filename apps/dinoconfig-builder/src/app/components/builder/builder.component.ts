import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from '../../services/config.service';
import { BrandService } from '../../services/brand.service';
import { Config, ConfigDefinition } from '../../models/config.models';
import { Brand } from '../../models/user.models';
import { BrandHeaderComponent } from '../brand-header/brand-header.component';
import { ConfigSidebarComponent } from '../config-sidebar/config-sidebar.component';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { SubscriptionLimitWarningComponent } from '../shared/subscription-limit-warning/subscription-limit-warning.component';
import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionStatus } from '../../models/subscription.models';
import { catchError, of } from 'rxjs';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { InputDialogComponent } from '../shared/input-dialog/input-dialog.component';
import { NotificationService } from '../../services/notification.service';

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
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  brand = signal<Brand | null>(null);
  configDefinitions = signal<ConfigDefinition[]>([]);
  selectedDefinitionId = signal<number | null>(null);
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
        this.brandId.set(brandId);
      } else {
        this.router.navigate(['/brands']);
      }
    });

    // Listen to child route params for configId (which is actually definitionId) to sync sidebar selection
    this.route.firstChild?.params.subscribe(params => {
      const definitionId = params['configId'] ? parseInt(params['configId']) : null;
      if (definitionId && this.selectedDefinitionId() !== definitionId) {
        this.selectedDefinitionId.set(definitionId);
      } else if (!definitionId) {
        this.selectedDefinitionId.set(null);
      }
    });

    this.loadSubscription();
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
        this.error.set(err.message || 'Failed to load config definitions');
        return of([]);
      })
    ).subscribe(definitions => {
      this.configDefinitions.set(definitions);
      this.isLoading.set(false);
    });
  }

  onConfigSelect(definitionId: number | null): void {
    const brandId = this.brandId();
    if (!brandId) return;
    this.selectedDefinitionId.set(definitionId);

    if (definitionId) {
      // Navigate to config route using definition ID
      this.router.navigate(['/brands', brandId, 'builder', 'configs', definitionId]);
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

        if (err.status === 403 && errorMessage.includes('maximum number of configs')) {
          this.limitReached.set(true);
        }
        
        this.notificationService.show(errorMessage, 'error');
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        // Add the new definition to the list
        this.configDefinitions.set([...this.configDefinitions(), response.definition]);
        this.limitReached.set(false);
        this.limitErrorMessage.set('');
        this.notificationService.show(`Configuration "${name}" created successfully`, 'success');
        // Navigate to the new config using definition ID
        this.router.navigate(['/brands', brandId, 'builder', 'configs', response.definition.id]);
      }
    });
  }

  onConfigDelete(definitionId: number): void {
    const brandId = this.brandId();
    if (!brandId) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this configuration? This action cannot be undone.' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const definitionName = this.configDefinitions().find(d => d.id === definitionId)?.name || 'Configuration';
        this.configService.deleteConfigDefinition(brandId, definitionId).pipe(
          catchError((err: any) => {
            const errorMessage = err.error?.message || err.message || 'Failed to delete configuration';
            this.notificationService.show(errorMessage, 'error');
            return of(null);
          })
        ).subscribe(() => {
          this.configDefinitions.set(this.configDefinitions().filter(d => d.id !== definitionId));
          // If deleted definition was selected, navigate back to builder
          if (this.selectedDefinitionId() === definitionId) {
            this.router.navigate(['/brands', brandId, 'builder']);
          }
          this.notificationService.show(`Configuration "${definitionName}" deleted successfully`, 'success');
        });
      }
    });
  }

  onConfigRename(definitionId: number): void {
    const definition = this.configDefinitions().find(d => d.id === definitionId);
    if (!definition) return;

    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: {
        title: 'Rename Configuration',
        label: 'Configuration Name',
        defaultValue: definition.name
      }
    });

    dialogRef.afterClosed().subscribe((newName: string | undefined) => {
      if (!newName || newName.trim() === '') return;

      const brandId = this.brandId();
      if (!brandId) return;

      this.configService.updateConfigName(brandId, definitionId, newName.trim()).pipe(
        catchError((err: any) => {
          const errorMessage = err.error?.message || err.message || 'Failed to rename configuration';
          this.notificationService.show(errorMessage, 'error');
          return of(null);
        })
      ).subscribe(updatedDefinition => {
        if (updatedDefinition) {
          // Update the definition in the list with the returned updated definition
          this.configDefinitions.set(this.configDefinitions().map(d => d.id === definitionId ? updatedDefinition : d));
          this.notificationService.show(`Configuration renamed to "${newName.trim()}" successfully`, 'success');
        }
      });
    });
  }

  onConfigUpdated(data: { config: Config; versions: Config[]; previousConfigId: number }): void {
    // Reload config definitions to ensure the list is up to date
    const brandId = this.brandId();
    if (brandId) {
      this.configService.getConfigDefinitions(brandId).pipe(
        catchError(() => of([]))
      ).subscribe(definitions => {
        this.configDefinitions.set(definitions);
      });
    }
  }

  goToBrands(): void {
    this.router.navigate(['/brands']);
  }
}

