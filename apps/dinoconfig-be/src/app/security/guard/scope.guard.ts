import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.get<string[]>('scopes', context.getHandler());

    if (!requiredScopes || requiredScopes.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.scopes) throw new ForbiddenException('No scopes found in token');

    const hasAllScopes = requiredScopes.every(scope => user.scopes.includes(scope));
    if (!hasAllScopes) {
      throw new ForbiddenException(`Missing required scopes: ${requiredScopes.join(', ')}`);
    }

    return true;
  }
}
