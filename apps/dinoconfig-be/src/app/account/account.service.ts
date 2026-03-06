import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AuthService } from '../security/service/auth.service';
import { UsersService } from '../users/user.service';
import { TokenBlacklistService } from '../security/service/token-blacklist.service';
import { AccountEventsService } from './account-events.service';
import { AccountEligibilityService } from './account-eligibility.service';
import { AccountEventType } from './entities/account-event.entity';
import { AccountStatus } from '../users/entities/user.entity';
import { ErrorMessages } from '../constants/error-messages';
import { Request } from 'express';
import { redactError } from '../logging/redact-sensitive';
import {
  ACCOUNT_CLOSE_SUCCESS_MESSAGE,
  ACCOUNT_RESTORE_SUCCESS_MESSAGE,
} from './constants/account.constants';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly accountEventsService: AccountEventsService,
    private readonly accountEligibilityService: AccountEligibilityService,
  ) {}

  /**
   * Close account: verify password, check unpaid invoices, update DB, block Auth0, revoke sessions, log event.
   */
  async closeAccount(auth0Id: string, password: string, req: Request): Promise<{ message: string; restoreToken?: string }> {
    const user = await this.usersService.findByAuth0Id(auth0Id);
    if (!user) {
      throw new HttpException(ErrorMessages.OPERATION.UNABLE_TO_COMPLETE, HttpStatus.NOT_FOUND);
    }
    if (user.status === AccountStatus.CLOSED) {
      throw new HttpException(ErrorMessages.ACCOUNT.ALREADY_CLOSED, HttpStatus.BAD_REQUEST);
    }

    const hasUnpaid = await this.accountEligibilityService.hasUnpaidInvoices(user.id);
    if (hasUnpaid) {
      throw new HttpException(ErrorMessages.ACCOUNT.UNPAID_INVOICES, HttpStatus.BAD_REQUEST);
    }

    this.logger.log({ message: 'Account close started', auth0Id, userId: user.id });

    try {
      await this.authService.verifyPassword(user.email, password);
    } catch (err) {
      const redacted = redactError(err instanceof Error ? err : new Error(String(err)));
      this.logger.warn({ message: 'Account close password verification failed', auth0Id, userId: user.id, error: redacted.message });
      throw new HttpException(ErrorMessages.ACCOUNT.INVALID_PASSWORD, HttpStatus.BAD_REQUEST);
    }

    const closedUser = await this.usersService.closeAccount(auth0Id);
    await this.authService.blockUser(auth0Id);

    const accessToken = req.cookies?.['access_token'];
    const refreshToken = req.cookies?.['refresh_token'];
    if (accessToken) {
      await this.tokenBlacklistService.blacklistToken(accessToken, 'access', 'account_closed');
    }
    if (refreshToken) {
      await this.tokenBlacklistService.blacklistToken(refreshToken, 'refresh', 'account_closed');
    }

    await this.accountEventsService.log(closedUser.id, AccountEventType.ACCOUNT_CLOSED, {
      auth0Id,
      deletionScheduledAt: closedUser.deletionScheduledAt?.toISOString(),
    });

    this.logger.log({
      message: 'Account closed successfully',
      auth0Id,
      userId: closedUser.id,
      deletionScheduledAt: closedUser.deletionScheduledAt?.toISOString(),
    });

    return {
      message: ACCOUNT_CLOSE_SUCCESS_MESSAGE,
      restoreToken: closedUser.restoreToken,
    };
  }

  /**
   * Restore account by one-time restore token (no auth required). Only if closed and within grace period.
   */
  async restoreAccountByToken(restoreToken: string): Promise<{ message: string }> {
    this.logger.log({ message: 'Account restore by token started', restoreTokenLength: restoreToken?.length ?? 0 });

    const user = await this.usersService.restoreByRestoreToken(restoreToken);
    await this.authService.unblockUser(user.auth0Id);
    await this.accountEventsService.log(user.id, AccountEventType.ACCOUNT_RESTORED, { auth0Id: user.auth0Id });

    this.logger.log({ message: 'Account restored successfully', auth0Id: user.auth0Id, userId: user.id });

    return { message: ACCOUNT_RESTORE_SUCCESS_MESSAGE };
  }
}
