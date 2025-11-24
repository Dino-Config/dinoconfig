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

  getFeatureDescription(feature: string): string {
    const descriptions: Record<string, string> = {
      'basic_configs': 'Create and manage basic configurations',
      'basic_sdk': 'Access to basic SDK features',
      'multiple_configs': 'Create multiple configurations',
      'unlimited_configs': 'Create unlimited configurations',
      'config_versioning': 'Track configuration version history',
      'config_rollback': 'Rollback configurations to previous versions',
      'multiple_brands': 'Manage multiple brands',
      'unlimited_brands': 'Create unlimited brands',
      'advanced_sdk': 'Access to advanced SDK features',
      'webhooks': 'Configure webhooks for real-time updates',
      'api_rate_limit_increased': 'Increased API rate limits',
      'advanced_targeting': 'Advanced targeting and configuration rules',
      'user_segmentation': 'Segment users for targeted configurations',
      'ab_testing': 'A/B testing capabilities',
      'analytics': 'Basic analytics and insights',
      'advanced_analytics': 'Advanced analytics with detailed metrics',
      'audit_logs': 'Comprehensive audit logging',
      'team_collaboration': 'Collaborate with team members',
      'role_based_access': 'Role-based access control',
      'priority_support': 'Priority customer support',
      'dedicated_support': 'Dedicated support team',
      'custom_integrations': 'Custom integrations and API extensions',
      'sso': 'Single Sign-On (SSO) support',
      'sla': 'Service Level Agreement (SLA) guarantees',
    };
    return descriptions[feature] || 'Feature description not available';
  }

  hasFeature(feature: string, subscription: SubscriptionStatus): boolean {
    return subscription.features[feature] === true;
  }

  createCheckoutSession(priceId: string): Observable<{ sessionId: string; url: string }> {
    return this.http.post<{ sessionId: string; url: string }>(
      `${this.apiUrl}/subscriptions/checkout-session`,
      { priceId },
      { withCredentials: true }
    );
  }

  createPortalSession(): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(
      `${this.apiUrl}/subscriptions/portal-session`,
      {},
      { withCredentials: true }
    );
  }

  changeSubscriptionPlan(priceId: string): Observable<LimitViolationsResult & { message: string; newTier: string; subscriptionId: string }> {
    return this.http.post<LimitViolationsResult & { message: string; newTier: string; subscriptionId: string }>(
      `${this.apiUrl}/subscriptions/change-plan`,
      { priceId },
      { withCredentials: true }
    );
  }

  cancelSubscription(): Observable<LimitViolationsResult & { message: string; newTier: string; subscriptionId: string }> {
    return this.http.post<LimitViolationsResult & { message: string; newTier: string; subscriptionId: string }>(
      `${this.apiUrl}/subscriptions/cancel-subscription`,
      {},
      { withCredentials: true }
    );
  }

  refreshSubscriptionStatus(): Observable<SubscriptionStatus> {
    return this.http.post<SubscriptionStatus>(
      `${this.apiUrl}/subscriptions/refresh-status`,
      {},
      { withCredentials: true }
    );
  }
}

