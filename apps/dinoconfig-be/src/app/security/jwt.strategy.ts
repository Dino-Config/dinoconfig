import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { cookieExtractor } from './jwt-extractor';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
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
      jwtFromRequest: cookieExtractor,
      audience,
      issuer: issuerUrl,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    if (payload.gty === 'client-credentials') {
      return { clientId: payload.sub };
    }
    return {
      auth0Id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}