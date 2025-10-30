import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_FEATURE_KEY } from '../decorators/require-feature.decorator';
import { SubscriptionService } from '../subscription.service';
import { Feature } from '../../features/enums/feature.enum';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<Feature>(REQUIRED_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const auth0Id: string | undefined = request?.user?.auth0Id;

    if (!auth0Id) {
      throw new ForbiddenException('Unauthorized');
    }

    const sub = await this.subscriptionService.getOrCreateDefaultSubscription(auth0Id);
    const allowed = this.subscriptionService.hasFeature(sub.tier, sub.status, requiredFeature);
    if (!allowed) {
      throw new ForbiddenException('Required feature not available on your current plan. Please upgrade to continue.');
    }
    return true;
  }
}


