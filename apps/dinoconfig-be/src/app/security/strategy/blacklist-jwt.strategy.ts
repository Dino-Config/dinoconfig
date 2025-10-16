import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { cookieExtractor } from '../jwt-extractor';
import { TokenBlacklistService } from '../service/token-blacklist.service';

@Injectable()
export class BlacklistJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
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
        ExtractJwt.fromAuthHeaderAsBearerToken(), // SDK tokens
      ]),
      audience,
      issuer: issuerUrl,
      algorithms: ['RS256'],
      passReqToCallback: true
    });
  }

  async validate(req: any, payload: any) {
    const token = req.cookies?.access_token;
  
    // If a token is present, validate against blacklist
    if (token) {
      const tokenId = this.tokenBlacklistService.extractJtiFromToken(token);
      if (tokenId && await this.tokenBlacklistService.isTokenBlacklisted(tokenId)) {
        throw new UnauthorizedException('Token has been invalidated');
      }
    } else if (payload.gty !== 'client-credentials') {
      // If no token and not client-credentials flow → unauthorized
      throw new UnauthorizedException('No token provided');
    }
  
    // Handle client credentials flow
    if (payload.gty === 'client-credentials') {
      return { 
        clientId: payload.sub,
        scopes: payload.scope?.split(' ') ?? [],
        company: payload['https://dinoconfig.com/company'] ?? null,
      };
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
