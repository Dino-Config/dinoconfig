import axios from 'axios';
import { environment } from '../../environments';

export interface SubscriptionStatus {
  tier: 'free' | 'starter' | 'pro' | 'custom';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  limits: {
    maxBrands: number;
    maxConfigsPerBrand: number;
  };
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
        return '5 brands, 10 configs per brand';
      case 'pro':
        return '20 brands, 20 configs per brand';
      case 'custom':
        return 'Unlimited brands and configs';
      default:
        return '';
    }
  }
}

export const subscriptionService = new SubscriptionService();

