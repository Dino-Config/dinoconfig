import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { PinoLogger } from 'nestjs-pino';

/**
 * Optional guard to attach authenticated user context to the current request's logs.
 * When used after UserAuthGuard (e.g. @UseGuards(UserAuthGuard, LogContextGuard)),
 * logs emitted during the request will include userId, email, and role when present.
 */
export interface LogContextUser {
  auth0Id?: string;
  email?: string;
  name?: string;
  company?: string;
  scopes?: string[];
}

@Injectable()
export class LogContextGuard implements CanActivate {
  constructor(private readonly logger: PinoLogger) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: LogContextUser }>();
    if (!req.user) return true;
    this.logger.assign({
      userId: req.user.auth0Id,
      email: req.user.email,
      role: req.user.scopes?.length ? 'authenticated' : undefined,
    });
    return true;
  }
}
