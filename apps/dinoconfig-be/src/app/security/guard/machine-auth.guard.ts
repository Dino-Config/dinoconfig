import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MachineAuthGuard extends AuthGuard('machine-jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }

    // Machine flow requires auth0Id to NOT be present (client credentials token)
    if (user.auth0Id) {
      throw new UnauthorizedException('Machine authentication required');
    }

    // Machine flow requires clientId to be present
    if (!user.clientId) {
      throw new UnauthorizedException('Machine authentication required');
    }

    return user;
  }
}

