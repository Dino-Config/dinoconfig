import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { cookieExtractor } from '../jwt-extractor';
import { TokenBlacklistService } from '../service/token-blacklist.service';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenBlacklistService: TokenBlacklistService,
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
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor, // user sessions (admins)
      ]),
      audience,
      issuer: issuerUrl,
      algorithms: ['RS256'],
      passReqToCallback: true
    });
  }

  async validate(req: any, payload: any) {
    const token = req.cookies?.access_token;
  
    // Validate against blacklist
    if (token) {
      const tokenId = this.tokenBlacklistService.extractJtiFromToken(token);
      if (tokenId && await this.tokenBlacklistService.isTokenBlacklisted(tokenId)) {
        throw new UnauthorizedException('Token has been invalidated');
      }
    } else {
      throw new UnauthorizedException('No token provided');
    }
  
    // Handle standard user flow
    return {
      auth0Id: payload.sub,
      email: payload.email,
      name: payload.name,
      company: payload['X-INTERNAL-COMPANY'] ?? null,
      scopes: payload.scope?.split(' ') ?? [],
    };
  }
}

