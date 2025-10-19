import React, { useEffect, useState } from 'react';
import { subscriptionService, SubscriptionStatus } from '../services/subscription.service';
import { environment } from '../../environments';
import { Spinner, Notification, useNotification } from '../components';
import './subscription-page.scss';

interface PlanCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  tier: string;
  currentTier?: string;
  isFeatured?: boolean;
  badge?: string;
  onAction: () => void;
  isProcessing?: boolean;
  isActive?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  name,
  price,
  period,
  description,
  features,
  tier,
  currentTier,
  isFeatured,
  badge,
  onAction,
  isProcessing,
  isActive
}) => {
  const isCurrentPlan = currentTier === tier;

  const getButtonText = () => {
    if (isCurrentPlan) return 'Current Plan';
    if (isProcessing) return 'Processing...';
    if (tier === 'free') return 'Downgrade to Free';
    if (tier === 'custom') return 'Contact Sales';
    if (!currentTier || currentTier === 'free') return `Upgrade to ${name}`;
    return 'Change Plan';
  };

  const getButtonClass = () => {
    if (isCurrentPlan) return 'btn btn--current';
    if (isFeatured) return 'btn btn--primary';
    return 'btn btn--secondary';
  };

  return (
    <div className={`plan-card ${isFeatured ? 'plan-card--featured' : ''} ${isCurrentPlan ? 'plan-card--active' : ''}`}>
      {badge && <div className="plan-card__badge">{badge}</div>}
      {isCurrentPlan && <div className="plan-card__active-indicator">✓</div>}
      
      <div className="plan-card__header">
        <h2 className="plan-card__name">{name}</h2>
        <div className="plan-card__price">
          <span className="plan-card__amount">{price}</span>
          {period && <span className="plan-card__period">{period}</span>}
        </div>
        <p className="plan-card__description">{description}</p>
      </div>

      <div className="plan-card__features">
        <ul>
          {features.map((feature, index) => (
            <li key={index}>
              <svg className="check-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="9" fill="#10b981"/>
                <path d="M5 9L8 12L13 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="plan-card__action">
        <button 
          className={getButtonClass()}
          onClick={onAction}
          disabled={isCurrentPlan || isProcessing}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export const SubscriptionPage: React.FC = () => {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const { notification, showNotification, hideNotification } = useNotification();

  // Drag scroll functionality
  useEffect(() => {
    console.log('REACT ENV VARIABLE', process.env.REACT_APP_GREETING)

    const plansGrid = document.querySelector('.plans-grid') as HTMLElement;
    if (!plansGrid) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      isDown = true;
      plansGrid.classList.add('active');
      startX = mouseEvent.pageX - plansGrid.offsetLeft;
      scrollLeft = plansGrid.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      plansGrid.classList.remove('active');
    };

    const handleMouseUp = () => {
      isDown = false;
      plansGrid.classList.remove('active');
    };

    const handleMouseMove = (e: Event) => {
      if (!isDown) return;
      const mouseEvent = e as MouseEvent;
      mouseEvent.preventDefault();
      const x = mouseEvent.pageX - plansGrid.offsetLeft;
      const walk = (x - startX) * 2; // scroll-fast
      plansGrid.scrollLeft = scrollLeft - walk;
    };

    // Touch events for mobile
    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      isDown = true;
      startX = touchEvent.touches[0].pageX - plansGrid.offsetLeft;
      scrollLeft = plansGrid.scrollLeft;
    };

    const handleTouchMove = (e: Event) => {
      if (!isDown) return;
      const touchEvent = e as TouchEvent;
      touchEvent.preventDefault();
      const x = touchEvent.touches[0].pageX - plansGrid.offsetLeft;
      const walk = (x - startX) * 2;
      plansGrid.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
      isDown = false;
    };

    // Add event listeners
    plansGrid.addEventListener('mousedown', handleMouseDown);
    plansGrid.addEventListener('mouseleave', handleMouseLeave);
    plansGrid.addEventListener('mouseup', handleMouseUp);
    plansGrid.addEventListener('mousemove', handleMouseMove);
    plansGrid.addEventListener('touchstart', handleTouchStart);
    plansGrid.addEventListener('touchmove', handleTouchMove);
    plansGrid.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      plansGrid.removeEventListener('mousedown', handleMouseDown);
      plansGrid.removeEventListener('mouseleave', handleMouseLeave);
      plansGrid.removeEventListener('mouseup', handleMouseUp);
      plansGrid.removeEventListener('mousemove', handleMouseMove);
      plansGrid.removeEventListener('touchstart', handleTouchStart);
      plansGrid.removeEventListener('touchmove', handleTouchMove);
      plansGrid.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscription(status);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (priceId: string, tier: string) => {
    try {
      setProcessingTier(tier);
      const { url } = await subscriptionService.createCheckoutSession(priceId);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      showNotification('Failed to start checkout. Please try again.', 'error');
      setProcessingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await subscriptionService.createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      showNotification('Customer portal not configured. Please configure it in your Stripe dashboard.', 'error');
    }
  };

  const handleChangePlan = async (priceId: string, tierName: string) => {
    try {
      setProcessingTier(tierName);
      const result = await subscriptionService.changeSubscriptionPlan(priceId);
      console.log('Plan change result:', result);
      showNotification(`Successfully changed to ${result.newTier} plan!`, 'success');
      // Reload subscription status
      loadSubscription();
    } catch (error) {
      console.error('Failed to change subscription plan:', error);
      showNotification('Failed to change subscription plan. Please try again.', 'error');
    } finally {
      setProcessingTier(null);
    }
  };

  const handleContactSales = () => {
    window.open('mailto:sales@dinoconfig.com?subject=Enterprise%20Plan%20Inquiry', '_blank');
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? This will downgrade you to the Free plan.')) {
      return;
    }

    try {
      setProcessingTier('free');
      const result = await subscriptionService.cancelSubscription();
      console.log('Cancel result:', result);
      showNotification('Subscription cancelled successfully. You are now on the Free plan.', 'success');
      // Reload subscription status
      loadSubscription();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      showNotification('Failed to cancel subscription. Please try again.', 'error');
    } finally {
      setProcessingTier(null);
    }
  };

  if (loading) {
    return (
      <div className="subscription-page">
        <Spinner text="Loading subscription plans..." size="large" fullHeight />
      </div>
    );
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        '1 brand',
        '1 config per brand',
        'Basic SDK',
        'Community support'
      ],
      tier: 'free',
      priceId: environment.stripeFreePriceId || 'price_free'
    },
    {
      name: 'Starter',
      price: '$9.99',
      period: '/month',
      description: 'Perfect for small projects',
      features: [
        '5 brands',
        '10 configs per brand',
        'Basic SDK',
        'Community support',
        '99.9% uptime SLA'
      ],
      tier: 'starter',
      priceId: environment.stripeStarterPriceId || 'price_starter'
    },
    {
      name: 'Pro',
      price: '$29.99',
      period: '/month',
      description: 'For growing teams',
      features: [
        '20 brands',
        '20 configs per brand',
        'All SDKs & APIs',
        'Advanced targeting',
        'Priority support',
        'Version history',
        'Team collaboration',
        '99.99% uptime SLA'
      ],
      tier: 'pro',
      priceId: environment.stripeProPriceId || 'price_pro',
      isFeatured: true,
      badge: 'Most Popular'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Unlimited brands & configs',
        'Everything in Pro',
        'SAML SSO',
        'Custom integrations',
        'Dedicated support',
        'On-premise option'
      ],
      tier: 'custom',
      priceId: 'contact'
    }
  ];

  return (
    <div className="subscription-page">
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      <div className="subscription-header">
        <div className="header-content">
          <h1 className="page-title">Subscription Plans</h1>
          <p className="page-subtitle">
            Choose the perfect plan for your needs. Cancel anytime.
          </p>
        </div>
        {subscription && (
          <div className="current-plan-badge">
            <span className="label">Current Plan:</span>
            <span className={`tier tier--${subscription.tier}`}>
              {subscriptionService.getTierDisplayName(subscription.tier)}
            </span>
            {subscription.currentPeriodEnd && (
              <span className="renewal">
                Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="subscription-content">
        <div className="plans-grid">
          {plans.map((plan) => (
            <PlanCard
              key={plan.tier}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              tier={plan.tier}
              currentTier={subscription?.tier}
              isFeatured={plan.isFeatured}
              badge={plan.badge}
              isActive={subscription?.isActive}
              isProcessing={processingTier === plan.tier}
              onAction={() => {
                if (plan.priceId === 'contact') {
                  handleContactSales();
                } else if (subscription?.tier === plan.tier) {
                  return;
                } else if (plan.priceId === 'free') {
                  // Handle downgrade to free
                  handleCancelSubscription();
                } else if (subscription && subscription.tier !== 'free' && plan.tier !== subscription.tier) {
                  // Handle plan changes for existing subscribers
                  handleChangePlan(plan.priceId, plan.tier);
                } else {
                  handleUpgrade(plan.priceId, plan.tier);
                }
              }}
            />
          ))}
        </div>

        {subscription && subscription.tier !== 'free' && (
          <div className="billing-section">
            <div className="billing-card">
              <div className="billing-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" fill="#f0f9ff"/>
                  <path d="M16 24h16M20 18v12M28 18v12" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="billing-content">
                <h3>Manage Billing & Subscription</h3>
                <p>Update payment methods, view invoices, and manage your subscription</p>
              </div>
              <button 
                className="btn btn--outline" 
                onClick={handleManageSubscription}
              >
                Open Billing Portal
              </button>
            </div>
          </div>
        )}

        {/* <div className="features-comparison">
          <h2 className="comparison-title">Why upgrade?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🚀</div>
              <h3>Scale with Confidence</h3>
              <p>Handle unlimited configurations and brands as your business grows</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h3>Priority Support</h3>
              <p>Get faster response times and dedicated assistance when you need it</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📊</div>
              <h3>Advanced Analytics</h3>
              <p>Gain insights into your configuration usage and performance metrics</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Enterprise Security</h3>
              <p>Advanced security features and compliance for peace of mind</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

