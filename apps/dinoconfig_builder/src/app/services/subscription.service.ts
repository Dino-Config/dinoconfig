import axios from 'axios';
import { environment } from '../../environments';
import { Feature, FeatureMap } from '../types/features';

export interface SubscriptionStatus {
  tier: 'free' | 'starter' | 'pro' | 'custom';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  limits: {
    maxBrands: number;
    maxConfigsPerBrand: number;
  };
  features: FeatureMap;
  currentPeriodEnd?: string;
  isActive: boolean;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface PortalSessionResponse {
  url: string;
}

export interface LimitViolation {
  type: 'brands' | 'configs';
  current: number;
  limit: number;
  message: string;
}

export interface LimitViolationsResult {
  hasViolations: boolean;
  violations: LimitViolation[];
  currentTier: string;
  limits: {
    maxBrands: number;
    maxConfigsPerBrand: number;
  };
}

class SubscriptionService {
  private baseUrl = environment.apiUrl;

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await axios.get<SubscriptionStatus>(
      `${this.baseUrl}/subscriptions/status`, {
        withCredentials: true 
      }
    );
    return response.data;
  }

  async createCheckoutSession(priceId: string): Promise<CheckoutSessionResponse> {
    const response = await axios.post<CheckoutSessionResponse>(
      `${this.baseUrl}/subscriptions/checkout-session`,
      { priceId },
      {
        withCredentials: true 
      }
    );
    return response.data;
  }

  async createPortalSession(): Promise<PortalSessionResponse> {
    const response = await axios.post<PortalSessionResponse>(
      `${this.baseUrl}/subscriptions/portal-session`,
      {},
      {
        withCredentials: true 
      }
    );
    return response.data;
  }

  async refreshSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await axios.post<SubscriptionStatus>(
      `${this.baseUrl}/subscriptions/refresh-status`,
      {},
      {
        withCredentials: true 
      }
    );
    return response.data;
  }

  async testWebhook(): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/subscriptions/test-webhook`,
      {},
      {
        withCredentials: true 
      }
    );
    return response.data;
  }

  async changeSubscriptionPlan(priceId: string): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/subscriptions/change-plan`,
      { priceId },
      {
        withCredentials: true 
      }
    );
    return response.data;
  }

  async cancelSubscription(): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/subscriptions/cancel-subscription`,
      {},
      {
        withCredentials: true 
      }
    );
    return response.data;
  }

  async checkLimitViolations(): Promise<LimitViolationsResult> {
    const response = await axios.get<LimitViolationsResult>(
      `${this.baseUrl}/subscriptions/limit-violations`,
      {
        withCredentials: true 
      }
    );
    return response.data;
  }


  getTierDisplayName(tier: string): string {
    switch (tier) {
      case 'free':
        return 'Free';
      case 'starter':
        return 'Starter';
      case 'pro':
        return 'Pro';
      case 'custom':
        return 'Custom';
      default:
        return tier;
    }
  }

  getTierDescription(tier: string): string {
    switch (tier) {
      case 'free':
        return '1 brand, 1 config per brand';
      case 'starter':
        return '5 brands, 3 configs per brand';
      case 'pro':
        return '20 brands, 20 configs per brand';
      case 'custom':
        return 'Unlimited brands and configs';
      default:
        return '';
    }
  }

  /**
   * Check if a specific feature is available
   */
  hasFeature(feature: Feature, subscriptionStatus: SubscriptionStatus): boolean {
    return subscriptionStatus.features[feature] === true;
  }

  /**
   * Get feature description
   */
  getFeatureDescription(feature: Feature): string {
    const descriptions: { [key in Feature]: string } = {
      [Feature.BASIC_CONFIGS]: 'Create and manage basic configurations',
      [Feature.BASIC_SDK]: 'Access to basic SDK features',
      [Feature.MULTIPLE_CONFIGS]: 'Create multiple configurations',
      [Feature.UNLIMITED_CONFIGS]: 'Create unlimited configurations',
      [Feature.CONFIG_VERSIONING]: 'Track configuration version history',
      [Feature.CONFIG_ROLLBACK]: 'Rollback configurations to previous versions',
      [Feature.MULTIPLE_BRANDS]: 'Manage multiple brands',
      [Feature.UNLIMITED_BRANDS]: 'Create unlimited brands',
      [Feature.ADVANCED_SDK]: 'Access to advanced SDK features',
      [Feature.WEBHOOKS]: 'Configure webhooks for real-time updates',
      [Feature.API_RATE_LIMIT_INCREASED]: 'Increased API rate limits',
      [Feature.ADVANCED_TARGETING]: 'Advanced targeting and configuration rules',
      [Feature.USER_SEGMENTATION]: 'Segment users for targeted configurations',
      [Feature.AB_TESTING]: 'A/B testing capabilities',
      [Feature.ANALYTICS]: 'Basic analytics and insights',
      [Feature.ADVANCED_ANALYTICS]: 'Advanced analytics with detailed metrics',
      [Feature.AUDIT_LOGS]: 'Comprehensive audit logging',
      [Feature.TEAM_COLLABORATION]: 'Collaborate with team members',
      [Feature.ROLE_BASED_ACCESS]: 'Role-based access control',
      [Feature.PRIORITY_SUPPORT]: 'Priority customer support',
      [Feature.DEDICATED_SUPPORT]: 'Dedicated support team',
      [Feature.CUSTOM_INTEGRATIONS]: 'Custom integrations and API extensions',
      [Feature.SSO]: 'Single Sign-On (SSO) support',
      [Feature.SLA]: 'Service Level Agreement (SLA) guarantees',
    };

    return descriptions[feature] || 'Feature description not available';
  }
}

export const subscriptionService = new SubscriptionService();
