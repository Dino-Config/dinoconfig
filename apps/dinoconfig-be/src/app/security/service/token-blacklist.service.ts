import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenBlacklist } from '../entities/token-blacklist.entity';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectRepository(TokenBlacklist)
    private readonly tokenBlacklistRepo: Repository<TokenBlacklist>,
  ) {}

  /**
   * Add a token to the blacklist
   */
  async blacklistToken(
    token: string,
    tokenType: 'access' | 'refresh',
    reason: string = 'logout'
  ): Promise<void> {
    try {
      // Decode the token to get its claims
      const decoded = jwt.decode(token) as any;
      
      if (!decoded) {
        console.warn('Could not decode token for blacklisting');
        return;
      }

      // Use jti if available, otherwise create a hash of the token as identifier
      const tokenIdentifier = decoded.jti || this.createTokenHash(token);
      const userId = decoded.sub || 'unknown';

      // Check if token is already blacklisted
      const existing = await this.tokenBlacklistRepo.findOne({
        where: { jti: tokenIdentifier }
      });

      if (existing) {
        return; // Already blacklisted
      }

      // Create blacklist entry
      const blacklistEntry = this.tokenBlacklistRepo.create({
        jti: tokenIdentifier,
        userId,
        tokenType,
        expiresAt: new Date((decoded.exp || 0) * 1000), // Convert from seconds to milliseconds
        reason,
      });

      await this.tokenBlacklistRepo.save(blacklistEntry);
    } catch (error) {
      console.error('Error blacklisting token:', error);
      // Don't throw error to avoid breaking logout flow
    }
  }

  /**
   * Check if a token is blacklisted
   */
  async isTokenBlacklisted(tokenIdentifier: string): Promise<boolean> {
    const blacklistedToken = await this.tokenBlacklistRepo.findOne({
      where: { jti: tokenIdentifier }
    });

    return !!blacklistedToken;
  }

  /**
   * Clean up expired tokens from blacklist
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.tokenBlacklistRepo
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }

  /**
   * Blacklist all tokens for a specific user
   */
  async blacklistUserTokens(userId: string, reason: string = 'logout'): Promise<void> {
    // This would require storing active tokens, which is more complex
    // For now, we'll just clean up expired tokens
    await this.cleanupExpiredTokens();
  }

  /**
   * Extract JTI from token or create hash if JTI not available
   */
  extractJtiFromToken(token: string): string | null {
    try {
      const decoded = jwt.decode(token) as any;
      return decoded?.jti || this.createTokenHash(token);
    } catch (error) {
      return this.createTokenHash(token);
    }
  }

  /**
   * Create a hash of the token for use as identifier when JTI is not available
   */
  private createTokenHash(token: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
