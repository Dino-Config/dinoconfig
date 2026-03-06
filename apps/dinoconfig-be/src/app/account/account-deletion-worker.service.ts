import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/user.service';
import { AuthService } from '../security/service/auth.service';
import { TokenBlacklistService } from '../security/service/token-blacklist.service';
import { AccountEventsService } from './account-events.service';
import { AccountEventType } from './entities/account-event.entity';
import { ACCOUNT_DELETION_CRON } from './constants/account-closure.constants';
import { redactError } from '../logging/redact-sensitive';

@Injectable()
export class AccountDeletionWorkerService {
  private readonly logger = new Logger(AccountDeletionWorkerService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly accountEventsService: AccountEventsService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @Cron(ACCOUNT_DELETION_CRON)
  async runPermanentDeletion(): Promise<void> {
    this.logger.log({ message: 'Running scheduled account permanent deletion' });
    const users = await this.usersService.findClosedEligibleForPermanentDeletion();
    let processedCount = 0;
    let failedCount = 0;

    for (const user of users) {
      try {
        await this.permanentlyDeleteAccount(user);
        processedCount += 1;
      } catch (err) {
        failedCount += 1;
        const redacted = redactError(err instanceof Error ? err : new Error(String(err)));
        this.logger.error({
          message: 'Failed to permanently delete account',
          auth0Id: user.auth0Id,
          userId: user.id,
          error: redacted.message,
        });
      }
    }

    this.logger.log({
      message: 'Account permanent deletion run completed',
      processedCount,
      failedCount,
      totalEligible: users.length,
    });
    if (failedCount > 0) {
      this.logger.warn({
        message: 'Some accounts failed permanent deletion',
        failedCount,
        processedCount,
      });
    }
  }

  /**
   * Permanently delete one account: audit log, blacklist cleanup, DB user (cascade), Auth0 user. Idempotent.
   */
  async permanentlyDeleteAccount(user: User): Promise<void> {
    const { id, auth0Id, email } = user;
    await this.accountEventsService.log(id, AccountEventType.ACCOUNT_DELETED, {
      auth0Id,
      email,
      deletedAt: new Date().toISOString(),
    });
    await this.tokenBlacklistService.deleteByAuth0Id(auth0Id);
    await this.userRepo.delete({ id });
    await this.authService.permanentlyDeleteAuth0User(auth0Id);
    this.logger.log({ message: 'Permanently deleted account', auth0Id, userId: id });
  }
}
