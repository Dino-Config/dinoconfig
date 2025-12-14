import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ApiKeyService } from '../../services/api-key.service';
import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionStatus } from '../../models/subscription.models';
import { ApiKeyList, CreateApiKeyRequest } from '../../models/api-key.models';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { catchError, of, filter } from 'rxjs';

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface GeneratedApiKey {
  key: string;
  name: string;
}

@Component({
  selector: 'dc-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    SpinnerComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private router = inject(Router);
  private apiKeyService = inject(ApiKeyService);
  private subscriptionService = inject(SubscriptionService);
  private dialog = inject(MatDialog);

  subscription = signal<SubscriptionStatus | null>(null);
  isLoadingSubscription = signal(true);
  apiKeys = signal<ApiKeyList | null>(null);
  isLoadingApiKeys = signal(true);
  
  expandedSections = signal<Set<string>>(new Set());
  currentRoute = signal<string>('');
  
  generatedApiKey = signal<GeneratedApiKey | null>(null);
  showCreateForm = signal(false);
  isGenerating = signal(false);
  newKeyName = signal('');
  newKeyDescription = signal('');
  notification = signal<Notification | null>(null);

  ngOnInit(): void {
    this.loadSubscription();
    this.loadApiKeys();
    this.updateExpandedSections();
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateExpandedSections();
    });
  }

  private updateExpandedSections(): void {
    const url = this.router.url;
    this.currentRoute.set(url);
    
    if (url === '/settings') {
      this.expandedSections.set(new Set(['sdk', 'features']));
    } else if (url === '/settings/sdk') {
      this.expandedSections.set(new Set(['sdk']));
    } else if (url === '/settings/features') {
      this.expandedSections.set(new Set(['features']));
    }
  }

  getPageTitle(): string {
    const route = this.currentRoute();
    if (route === '/settings/sdk') {
      return 'SDK & API Keys';
    } else if (route === '/settings/features') {
      return 'Features';
    }
    return 'Settings';
  }

  getPageSubtitle(): string {
    const route = this.currentRoute();
    if (route === '/settings/sdk') {
      return 'Manage SDK authentication keys for your apps';
    } else if (route === '/settings/features') {
      return 'Your plan and available capabilities';
    }
    return 'Manage your application preferences and configurations';
  }

  loadSubscription(): void {
    this.isLoadingSubscription.set(true);

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
      this.isLoadingSubscription.set(false);
    });
  }

  loadApiKeys(): void {
    this.isLoadingApiKeys.set(true);

    this.apiKeyService.getApiKeys().pipe(
      catchError(() => of(null))
    ).subscribe(data => {
      this.apiKeys.set(data);
      this.isLoadingApiKeys.set(false);
    });
  }

  toggleSection(section: string): void {
    const current = new Set(this.expandedSections());
    if (current.has(section)) {
      current.delete(section);
    } else {
      current.add(section);
    }
    this.expandedSections.set(current);
  }

  isExpanded(section: string): boolean {
    return this.expandedSections().has(section);
  }

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification.set({ type, message });
    setTimeout(() => this.notification.set(null), 5000);
  }

  createApiKey(): void {
    if (!this.newKeyName().trim()) {
      this.showNotification('error', 'Please enter a name for the API key.');
      return;
    }

    this.isGenerating.set(true);
    const request: CreateApiKeyRequest = {
      name: this.newKeyName().trim(),
      description: this.newKeyDescription().trim() || undefined
    };

    this.apiKeyService.createApiKey(request).pipe(
      catchError((err: any) => {
        const message = err.error?.message || 'Failed to create API key. Please try again.';
        this.showNotification('error', message);
        return of(null);
      })
    ).subscribe(data => {
      if (data) {
        this.generatedApiKey.set({ key: data.key, name: data.name });
        this.newKeyName.set('');
        this.newKeyDescription.set('');
        this.showCreateForm.set(false);
        this.loadApiKeys();
        this.showNotification('success', 'API key created successfully! Make sure to copy it - you won\'t be able to see it again.');
      }
      this.isGenerating.set(false);
    });
  }

  revokeApiKey(id: number, name: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Are you sure you want to revoke "${name}"? This action cannot be undone and will break any applications using this key.` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.apiKeyService.revokeApiKey(id).pipe(
        catchError(() => {
          this.showNotification('error', 'Failed to revoke API key. Please try again.');
          return of(null);
        })
      ).subscribe(() => {
        this.loadApiKeys();
        this.showNotification('success', 'API key revoked successfully.');
      });
    });
  }

  deleteApiKey(id: number, name: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Are you sure you want to delete "${name}"? This action cannot be undone.` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.apiKeyService.deleteApiKey(id).pipe(
        catchError(() => {
          this.showNotification('error', 'Failed to delete API key. Please try again.');
          return of(null);
        })
      ).subscribe(() => {
        this.loadApiKeys();
        this.showNotification('success', 'API key deleted successfully.');
      });
    });
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('success', 'API key copied to clipboard!');
    }).catch(() => {
      this.showNotification('error', 'Failed to copy to clipboard.');
    });
  }

  getTierDisplayName(tier: string): string {
    return this.subscriptionService.getTierDisplayName(tier);
  }

  getFeatureDescription(feature: string): string {
    return this.subscriptionService.getFeatureDescription(feature);
  }

  hasFeature(feature: string): boolean {
    const sub = this.subscription();
    if (!sub) return false;
    return this.subscriptionService.hasFeature(feature, sub);
  }

  getFeatureTier(feature: string): 'free' | 'starter' | 'pro' | 'custom' {
    if (feature === 'basic_configs' || feature === 'basic_sdk') {
      return 'free';
    } else if (['multiple_brands', 'multiple_configs'].includes(feature)) {
      return 'starter';
    } else if (['unlimited_brands', 'unlimited_configs', 'config_rollback', 'advanced_sdk', 'api_rate_limit_increased', 'advanced_targeting', 'user_segmentation', 'ab_testing', 'advanced_analytics', 'audit_logs', 'team_collaboration', 'priority_support'].includes(feature)) {
      return 'pro';
    } else {
      return 'custom';
    }
  }

  getAllFeatures(): string[] {
    return [
      'basic_configs',
      'basic_sdk',
      'multiple_configs',
      'unlimited_configs',
      'config_versioning',
      'config_rollback',
      'multiple_brands',
      'unlimited_brands',
      'advanced_sdk',
      'webhooks',
      'api_rate_limit_increased',
      'advanced_targeting',
      'user_segmentation',
      'ab_testing',
      'analytics',
      'advanced_analytics',
      'audit_logs',
      'team_collaboration',
      'role_based_access',
      'priority_support',
      'dedicated_support',
      'custom_integrations',
      'sso',
      'sla'
    ];
  }

  goToSubscription(): void {
    this.router.navigate(['/subscription']);
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  }
}

