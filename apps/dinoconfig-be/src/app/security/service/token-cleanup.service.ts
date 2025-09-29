import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private readonly tokenBlacklistService: TokenBlacklistService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredTokens() {
    try {
      await this.tokenBlacklistService.cleanupExpiredTokens();
      this.logger.log('Expired tokens cleaned up successfully');
    } catch (error) {
      this.logger.error('Failed to cleanup expired tokens:', error);
    }
  }
}
