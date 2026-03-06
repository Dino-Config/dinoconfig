import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ACCOUNT_CLOSURE_RATE_LIMIT_WINDOW_MS,
  ACCOUNT_CLOSURE_RATE_LIMIT_MAX_ATTEMPTS,
} from '../constants/account-closure.constants';

interface Window {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limit for account close/restore endpoints.
 * Store is per-instance; for production with multiple instances use a shared store (e.g. Redis).
 */
@Injectable()
export class AccountClosureRateLimitGuard implements CanActivate {
  private readonly store = new Map<string, Window>();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const key = (req.ip || req.socket?.remoteAddress || 'unknown').trim();
    const now = Date.now();
    let window = this.store.get(key);

    if (!window) {
      window = { count: 1, resetAt: now + ACCOUNT_CLOSURE_RATE_LIMIT_WINDOW_MS };
      this.store.set(key, window);
      return true;
    }

    if (now >= window.resetAt) {
      window.count = 1;
      window.resetAt = now + ACCOUNT_CLOSURE_RATE_LIMIT_WINDOW_MS;
      return true;
    }

    window.count += 1;
    if (window.count > ACCOUNT_CLOSURE_RATE_LIMIT_MAX_ATTEMPTS) {
      throw new HttpException(
        'Too many attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
