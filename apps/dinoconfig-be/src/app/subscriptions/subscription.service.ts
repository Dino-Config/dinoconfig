import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionTier, SubscriptionStatus } from './entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { Brand } from '../brands/entities/brand.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ActiveVersion } from '../configs/entities/active-version.entity';
import { Feature } from '../features/enums/feature.enum';

export interface TierLimits {
  maxBrands: number;
  maxConfigsPerBrand: number;
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
  currentTier: SubscriptionTier;
  limits: TierLimits;
}

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription) private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(ActiveVersion) private activeVersionRepo: Repository<ActiveVersion>,
  ) {}

  async findByUserId(userId: number): Promise<Subscription | null> {
    return this.subscriptionRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });
  }

  async findByAuth0Id(auth0Id: string): Promise<Subscription | null> {
    return this.subscriptionRepo.findOne({
      where: { user: { auth0Id } },
      relations: ['user']
    });
  }

  private async findByUserIdentifier(userIdOrAuth0Id: number | string): Promise<Subscription | null> {
    if (typeof userIdOrAuth0Id === 'number') {
      return this.findByUserId(userIdOrAuth0Id);
    }
    return this.findByAuth0Id(userIdOrAuth0Id);
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
    return this.subscriptionRepo.findOne({
      where: { stripeCustomerId },
      relations: ['user']
    });
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    return this.subscriptionRepo.findOne({
      where: { stripeSubscriptionId },
      relations: ['user']
    });
  }

  async createOrUpdateSubscription(userIdOrAuth0Id: number | string, dto: CreateSubscriptionDto): Promise<Subscription> {
    const existing = await this.findByUserIdentifier(userIdOrAuth0Id);
    
    const limits = this.getTierLimits(dto.tier);
    
    if (existing) {
      existing.tier = dto.tier;
      existing.status = dto.status || existing.status;
      existing.stripeCustomerId = dto.stripeCustomerId !== undefined ? dto.stripeCustomerId : existing.stripeCustomerId;
      existing.stripeSubscriptionId = dto.stripeSubscriptionId !== undefined ? dto.stripeSubscriptionId : existing.stripeSubscriptionId;
      existing.stripePriceId = dto.stripePriceId !== undefined ? dto.stripePriceId : existing.stripePriceId;
      existing.maxBrands = limits.maxBrands;
      existing.maxConfigsPerBrand = limits.maxConfigsPerBrand;
      
      return this.subscriptionRepo.save(existing);
    }

    // Load the user entity by id or auth0Id
    let user: User | null = null;
    if (typeof userIdOrAuth0Id === 'number') {
      user = await this.userRepo.findOne({ where: { id: userIdOrAuth0Id } });
    } else {
      user = await this.userRepo.findOne({ where: { auth0Id: userIdOrAuth0Id } });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const subscription = this.subscriptionRepo.create({
      user: { id: user.id },
      tier: dto.tier,
      status: dto.status || SubscriptionStatus.ACTIVE,
      stripeCustomerId: dto.stripeCustomerId,
      stripeSubscriptionId: dto.stripeSubscriptionId,
      stripePriceId: dto.stripePriceId,
      maxBrands: limits.maxBrands,
      maxConfigsPerBrand: limits.maxConfigsPerBrand,
    });

    return this.subscriptionRepo.save(subscription);
  }

  async getOrCreateDefaultSubscription(userIdOrAuth0Id: number | string): Promise<Subscription> {
    let subscription = await this.findByUserIdentifier(userIdOrAuth0Id);
    
    if (!subscription) {
      subscription = await this.createOrUpdateSubscription(userIdOrAuth0Id, {
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
      });
    }

    return subscription;
  }

  getTierLimits(tier: SubscriptionTier): TierLimits {
    switch (tier) {
      case SubscriptionTier.FREE:
        return {
          maxBrands: 1,
          maxConfigsPerBrand: 1
        };
      case SubscriptionTier.STARTER:
        return {
          maxBrands: 5,
          maxConfigsPerBrand: 10
        };
      case SubscriptionTier.PRO:
        return {
          maxBrands: 20,
          maxConfigsPerBrand: 20
        };
      case SubscriptionTier.CUSTOM:
        return {
          maxBrands: -1, // unlimited
          maxConfigsPerBrand: -1 // unlimited
        };
    }
  }

  /**
   * Get all features available for a specific tier
   */
  getTierFeatures(tier: SubscriptionTier): Feature[] {
    const featureMap: { [key in SubscriptionTier]: Feature[] } = {
      [SubscriptionTier.FREE]: [
        Feature.BASIC_CONFIGS,
        Feature.BASIC_SDK,
      ],
      [SubscriptionTier.STARTER]: [
        Feature.BASIC_CONFIGS,
        Feature.BASIC_SDK,
        Feature.MULTIPLE_BRANDS,
        Feature.MULTIPLE_CONFIGS,
      ],
      [SubscriptionTier.PRO]: [
        Feature.BASIC_CONFIGS,
        Feature.BASIC_SDK,
        Feature.MULTIPLE_BRANDS,
        Feature.UNLIMITED_BRANDS,
        Feature.MULTIPLE_CONFIGS,
        Feature.UNLIMITED_CONFIGS,
        Feature.CONFIG_VERSIONING,
        Feature.CONFIG_ROLLBACK,
        Feature.WEBHOOKS,
        Feature.ADVANCED_SDK,
        Feature.API_RATE_LIMIT_INCREASED,
        Feature.ADVANCED_TARGETING,
        Feature.USER_SEGMENTATION,
        Feature.AB_TESTING,
        Feature.ANALYTICS,
        Feature.ADVANCED_ANALYTICS,
        Feature.AUDIT_LOGS,
        Feature.TEAM_COLLABORATION,
        Feature.PRIORITY_SUPPORT,
      ],
      [SubscriptionTier.CUSTOM]: Object.values(Feature), // All features
    };

    return featureMap[tier] || [];
  }

  /**
   * Check if a tier has a specific feature
   */
  hasFeature(tier: SubscriptionTier, status: SubscriptionStatus, feature: Feature): boolean {
    // If subscription is not active, only allow basic features
    if (status !== SubscriptionStatus.ACTIVE && status !== SubscriptionStatus.TRIALING) {
      return feature === Feature.BASIC_CONFIGS || feature === Feature.BASIC_SDK;
    }

    const features = this.getTierFeatures(tier);
    return features.includes(feature);
  }

  /**
   * Get features as a map for easy lookup
   */
  getFeaturesMap(tier: SubscriptionTier, status: SubscriptionStatus): { [key in Feature]?: boolean } {
    const featuresMap: { [key in Feature]?: boolean } = {};
    const allFeatures = Object.values(Feature);

    for (const feature of allFeatures) {
      featuresMap[feature] = this.hasFeature(tier, status, feature);
    }

    return featuresMap;
  }

  async checkBrandLimit(userIdOrAuth0Id: number | string): Promise<void> {
    const subscription = await this.getOrCreateDefaultSubscription(userIdOrAuth0Id);
    
    if (subscription.maxBrands === -1) {
      return; // unlimited
    }

    const brandCount = await this.brandRepo.count({
      where: typeof userIdOrAuth0Id === 'number'
        ? { user: { id: userIdOrAuth0Id } }
        : { user: { auth0Id: userIdOrAuth0Id } }
    });

    if (brandCount >= subscription.maxBrands) {
      throw new ForbiddenException(
        `You have reached the maximum number of brands (${subscription.maxBrands}) for your ${subscription.tier} tier. Please upgrade your subscription.`
      );
    }
  }

  async checkConfigLimit(userIdOrAuth0Id: number | string, brandId: number, company: string): Promise<void> {
    const subscription = await this.getOrCreateDefaultSubscription(userIdOrAuth0Id);
    
    if (subscription.maxConfigsPerBrand === -1) {
      return; // unlimited
    }

    const configCount = await this.activeVersionRepo.count({
      where: { brand: { id: brandId }, company: company }
    });

    if (configCount >= subscription.maxConfigsPerBrand) {
      throw new ForbiddenException(
        `You have reached the maximum number of configs (${subscription.maxConfigsPerBrand}) per brand for your ${subscription.tier} tier. Please upgrade your subscription.`
      );
    }
  }

  async updateStripeSubscription(
    userIdOrAuth0Id: number | string,
    stripeSubscriptionId: string,
    status: SubscriptionStatus,
    currentPeriodEnd: Date
  ): Promise<Subscription> {
    const subscription = await this.findByUserIdentifier(userIdOrAuth0Id);
    
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.stripeSubscriptionId = stripeSubscriptionId;
    subscription.status = status;
    subscription.currentPeriodEnd = currentPeriodEnd;

    return this.subscriptionRepo.save(subscription);
  }

  async cancelSubscription(userIdOrAuth0Id: number | string): Promise<Subscription> {
    const subscription = await this.findByUserIdentifier(userIdOrAuth0Id);
    
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.tier = SubscriptionTier.FREE;
    subscription.maxBrands = 1;
    subscription.maxConfigsPerBrand = 1;
    // Clear Stripe-related fields since subscription is cancelled
    subscription.stripeSubscriptionId = null;
    subscription.stripePriceId = null;

    return this.subscriptionRepo.save(subscription);
  }

  async checkLimitViolations(userIdOrAuth0Id: number | string): Promise<LimitViolationsResult> {
    // Force a fresh query by bypassing any potential caching
    const subscription = await this.subscriptionRepo.findOne({
      where: typeof userIdOrAuth0Id === 'number'
        ? { user: { id: userIdOrAuth0Id } }
        : { user: { auth0Id: userIdOrAuth0Id } },
      relations: ['user'],
      cache: false // Disable caching to ensure fresh data
    });
    
    if (!subscription) {
      // If no subscription found, create default FREE subscription
      const defaultSub = await this.createOrUpdateSubscription(userIdOrAuth0Id, {
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
      });
      return this.checkLimitViolationsWithSubscription(defaultSub, userIdOrAuth0Id);
    }
    
    return this.checkLimitViolationsWithSubscription(subscription, userIdOrAuth0Id);
  }

  private async checkLimitViolationsWithSubscription(subscription: Subscription, userIdOrAuth0Id: number | string): Promise<LimitViolationsResult> {
    const limits = this.getTierLimits(subscription.tier);
    const violations: LimitViolation[] = [];

    // Check brand limit violations
    if (limits.maxBrands !== -1) {
      const brandCount = await this.brandRepo.count({
        where: typeof userIdOrAuth0Id === 'number'
          ? { user: { id: userIdOrAuth0Id } }
          : { user: { auth0Id: userIdOrAuth0Id } }
      });

      if (brandCount > limits.maxBrands) {
        violations.push({
          type: 'brands',
          current: brandCount,
          limit: limits.maxBrands,
          message: `You have ${brandCount} brands but your ${subscription.tier} plan only allows ${limits.maxBrands} brands. Please upgrade to continue using all your brands.`
        });
      }
    }

    // Check config limit violations per brand using active_versions table
    if (limits.maxConfigsPerBrand !== -1) {
      const brands = await this.brandRepo.find({
        where: typeof userIdOrAuth0Id === 'number'
          ? { user: { id: userIdOrAuth0Id } }
          : { user: { auth0Id: userIdOrAuth0Id } }
      });

      for (const brand of brands) {
        // Count active versions (configs) for this brand
        const configCount = await this.activeVersionRepo.count({
          where: { brand: { id: brand.id } }
        });
        
        if (configCount > limits.maxConfigsPerBrand) {
          violations.push({
            type: 'configs',
            current: configCount,
            limit: limits.maxConfigsPerBrand,
            message: `Brand "${brand.name}" has ${configCount} configs but your ${subscription.tier} plan only allows ${limits.maxConfigsPerBrand} configs per brand. Please upgrade to continue using all configs.`
          });
        }
      }
    }

    return {
      hasViolations: violations.length > 0,
      violations,
      currentTier: subscription.tier,
      limits
    };
  }
}

