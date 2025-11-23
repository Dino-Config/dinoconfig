import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SubscriptionStatus, LimitViolationsResult } from '../models/subscription.models';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getSubscriptionWithViolations(): Observable<LimitViolationsResult> {
    return this.http.get<LimitViolationsResult>(`${this.apiUrl}/subscriptions/limit-violations`, {
      withCredentials: true
    });
  }

  getTierDisplayName(tier: string): string {
    const tierMap: Record<string, string> = {
      'free': 'Free',
      'starter': 'Starter',
      'pro': 'Pro',
      'custom': 'Custom'
    };
    return tierMap[tier] || tier;
  }
}

