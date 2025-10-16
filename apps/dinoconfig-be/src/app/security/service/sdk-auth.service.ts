import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiKeyService } from './api-key.service';
import { brandHeaderExtractor } from '../jwt-extractor';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface SDKTokenResponse extends TokenResponse {
  company?: string;
}

@Injectable()
export class SdkAuthService {
  private AUTH0_DOMAIN: string;
  private SDK_CLIENT_ID: string;
  private SDK_CLIENT_SECRET: string;
  private AUTH0_AUDIENCE: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly apiKeyService: ApiKeyService,
  ) {
    this.AUTH0_DOMAIN = this.configService.get<string>('AUTH0_DOMAIN');
    this.SDK_CLIENT_ID = this.configService.get<string>('SDK_CLIENT_ID');
    this.SDK_CLIENT_SECRET = this.configService.get<string>('SDK_CLIENT_SECRET');
    this.AUTH0_AUDIENCE = this.configService.get<string>('AUTH0_AUDIENCE');
  }

  /**
   * Generate SDK token using client credentials
   */
  private async generateSdkToken(company?: string): Promise<TokenResponse> {
    const res = await fetch(`https://${this.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.SDK_CLIENT_ID,
        client_secret: this.SDK_CLIENT_SECRET,
        audience: this.AUTH0_AUDIENCE,
        grant_type: 'client_credentials',
        ...(company && { company }),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new HttpException(
        err || 'Failed to generate SDK token',
        res.status,
      );
    }

    return res.json();
  }

  /**
   * Exchange API key for SDK token
   */
  async exchangeApiKeyForToken(apiKeyString: string): Promise<SDKTokenResponse> {
    // Validate API key
    const apiKey = await this.apiKeyService.validateApiKey(apiKeyString);

    if (!apiKey) {
      throw new HttpException(
        'Invalid or inactive API key',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Generate token using client credentials
    const tokenData = await this.generateSdkToken(apiKey.user.companyName);

    return {
      ...tokenData,
      company: apiKey.user.companyName,
    };
  }

  /**
   * Get SDK token with request context (for backward compatibility)
   */
  async getSDKTokenFromRequest(req: any): Promise<SDKTokenResponse> {
    const company = brandHeaderExtractor(req);
    const tokenData = await this.generateSdkToken(company);

    return {
      ...tokenData,
      ...(company && { company }),
    };
  }
}


