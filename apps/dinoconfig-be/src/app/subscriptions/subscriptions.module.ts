import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { User } from '../users/entities/user.entity';
import { Brand } from '../brands/entities/brand.entity';
import { ActiveVersion } from '../configs/entities/active-version.entity';
import { SubscriptionService } from './subscription.service';
import { StripeService } from './stripe.service';
import { SubscriptionController } from './subscription.controller';
import { WebhookController } from './webhook.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, SubscriptionPlan, User, Brand, ActiveVersion]),
    ConfigModule,
    UsersModule,
  ],
  controllers: [SubscriptionController, WebhookController],
  providers: [SubscriptionService, StripeService],
  exports: [SubscriptionService, StripeService],
})
export class SubscriptionsModule {}

