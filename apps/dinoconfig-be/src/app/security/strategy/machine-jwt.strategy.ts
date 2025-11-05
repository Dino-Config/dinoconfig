import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MachineJwtStrategy extends PassportStrategy(Strategy, 'machine-jwt') {
  constructor(
    private readonly configService: ConfigService,
  ) {
    const issuerUrl = configService.get<string>('AUTH0_ISSUER_URL');
    const audience = configService.get<string>('AUTH0_AUDIENCE');
    const jwksUri = new URL('.well-known/jwks.json', issuerUrl).toString();

    super({
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // SDK tokens
      audience,
      issuer: issuerUrl,
      algorithms: ['RS256'],
      passReqToCallback: true
    });
  }

  async validate(req: any, payload: any) {
    // Handle client credentials flow
    // Only client-credentials tokens should reach here
    if (payload.gty !== 'client-credentials') {
      throw new UnauthorizedException('Invalid token type for machine authentication');
    }

    return { 
      clientId: payload.sub,
      scopes: payload.scope?.split(' ') ?? [],
      company: payload['https://dinoconfig.com/company'] ?? null,
    };
  }
}

