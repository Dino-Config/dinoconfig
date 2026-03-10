import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEvent } from './entities/account-event.entity';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountEventsService } from './account-events.service';
import { AccountDeletionWorkerService } from './account-deletion-worker.service';
import { AccountClosureRateLimitGuard } from './guards/account-closure-rate-limit.guard';
import { AccountEligibilityService } from './account-eligibility.service';
import { AuthModule } from '../security/module/auth.module';
import { UsersModule } from '../users/users.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEvent, User]),
    AuthModule,
    UsersModule,
    SubscriptionsModule,
  ],
  controllers: [AccountController],
  providers: [
    AccountService,
    AccountEventsService,
    AccountEligibilityService,
    AccountDeletionWorkerService,
    AccountClosureRateLimitGuard,
  ],
  exports: [AccountService, AccountEventsService],
})
export class AccountModule {}
