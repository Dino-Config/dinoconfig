import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionTier, SubscriptionStatus } from './entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Config } from '../configs/entities/config.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

export interface TierLimits {
  maxBrands: number;
  maxConfigsPerBrand: number;
}

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription) private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(Config) private configRepo: Repository<Config>,
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

  async createOrUpdateSubscription(userId: number, dto: CreateSubscriptionDto): Promise<Subscription> {
    const existing = await this.findByUserId(userId);
    
    const limits = this.getTierLimits(dto.tier);
    
    if (existing) {
      existing.tier = dto.tier;
      existing.status = dto.status || existing.status;
      existing.stripeCustomerId = dto.stripeCustomerId || existing.stripeCustomerId;
      existing.stripeSubscriptionId = dto.stripeSubscriptionId || existing.stripeSubscriptionId;
      existing.stripePriceId = dto.stripePriceId || existing.stripePriceId;
      existing.maxBrands = limits.maxBrands;
      existing.maxConfigsPerBrand = limits.maxConfigsPerBrand;
      
      return this.subscriptionRepo.save(existing);
    }

    const subscription = this.subscriptionRepo.create({
      user: { id: userId },
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

  async getOrCreateDefaultSubscription(userId: number): Promise<Subscription> {
    let subscription = await this.findByUserId(userId);
    
    if (!subscription) {
      subscription = await this.createOrUpdateSubscription(userId, {
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

  async checkBrandLimit(userId: number): Promise<void> {
    const subscription = await this.getOrCreateDefaultSubscription(userId);
    
    if (subscription.maxBrands === -1) {
      return; // unlimited
    }

    const brandCount = await this.brandRepo.count({
      where: { user: { id: userId } }
    });

    if (brandCount >= subscription.maxBrands) {
      throw new ForbiddenException(
        `You have reached the maximum number of brands (${subscription.maxBrands}) for your ${subscription.tier} tier. Please upgrade your subscription.`
      );
    }
  }

  async checkConfigLimit(userId: number, brandId: number): Promise<void> {
    const subscription = await this.getOrCreateDefaultSubscription(userId);
    
    if (subscription.maxConfigsPerBrand === -1) {
      return; // unlimited
    }

    const configCount = await this.configRepo.count({
      where: { brand: { id: brandId, user: { id: userId } } }
    });

    if (configCount >= subscription.maxConfigsPerBrand) {
      throw new ForbiddenException(
        `You have reached the maximum number of configs (${subscription.maxConfigsPerBrand}) per brand for your ${subscription.tier} tier. Please upgrade your subscription.`
      );
    }
  }

  async updateStripeSubscription(
    userId: number,
    stripeSubscriptionId: string,
    status: SubscriptionStatus,
    currentPeriodEnd: Date
  ): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.stripeSubscriptionId = stripeSubscriptionId;
    subscription.status = status;
    subscription.currentPeriodEnd = currentPeriodEnd;

    return this.subscriptionRepo.save(subscription);
  }

  async cancelSubscription(userId: number): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.tier = SubscriptionTier.FREE;
    subscription.maxBrands = 1;
    subscription.maxConfigsPerBrand = 1;

    return this.subscriptionRepo.save(subscription);
  }
}

