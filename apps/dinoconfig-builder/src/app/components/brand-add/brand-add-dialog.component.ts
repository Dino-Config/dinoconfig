import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatError } from '@angular/material/form-field';
import { BrandService } from '../../services/brand.service';
import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionStatus } from '../../models/subscription.models';
import { SubscriptionLimitWarningComponent } from '../shared/subscription-limit-warning/subscription-limit-warning.component';
import { catchError, of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'dc-brand-add-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatError,
    SubscriptionLimitWarningComponent
  ],
  templateUrl: './brand-add-dialog.component.html',
  styleUrl: './brand-add-dialog.component.scss'
})
export class BrandAddDialogComponent {
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);
  private subscriptionService = inject(SubscriptionService);
  public dialogRef = inject(MatDialogRef<BrandAddDialogComponent>);

  isLoading = signal(false);
  error = signal<string | null>(null);
  limitReached = signal(false);
  subscription = signal<SubscriptionStatus | null>(null);

  brandForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    logo: [''],
    website: ['']
  });

  constructor() {
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

  onSubmit(): void {
    if (this.brandForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.limitReached.set(false);

    const formValue = this.brandForm.value;
    
    // Validate URLs if provided
    if (formValue.logo && !formValue.logo.match(/^https?:\/\/.+/)) {
      this.error.set('Please enter a valid logo URL');
      this.isLoading.set(false);
      return;
    }
    
    if (formValue.website && !formValue.website.match(/^https?:\/\/.+/)) {
      this.error.set('Please enter a valid website URL');
      this.isLoading.set(false);
      return;
    }

    this.brandService.createBrand({
      name: formValue.name,
      description: formValue.description || undefined,
      logo: formValue.logo || undefined,
      website: formValue.website || undefined,
    }).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.dialogRef.close(data); // Close with success flag
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const errorMessage = err.error?.message || 'Failed to create brand';
        this.error.set(errorMessage);

        // Check if it's a subscription limit error
        if (err.status === 403 && errorMessage.includes('maximum number of brands')) {
          this.limitReached.set(true);
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

