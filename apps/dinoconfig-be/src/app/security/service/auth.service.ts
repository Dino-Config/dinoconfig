import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface Auth0User {
  user_id: string;
  email: string;
  name?: string;
}

@Injectable()
export class AuthService {
  private managementApiToken: string;

  private AUTH0_DOMAIN: string;
  private CLIENT_ID: string;
  private CLIENT_SECRET: string;
  private DB_CONNECTION: string;

  constructor(private configService: ConfigService) {
    this.AUTH0_DOMAIN = this.configService.get<string>('AUTH0_DOMAIN');
    this.CLIENT_ID = this.configService.get<string>('AUTH0_M2M_CLIENT_ID');
    this.CLIENT_SECRET = this.configService.get<string>('AUTH0_M2M_CLIENT_SECRET');
    this.DB_CONNECTION = this.configService.get<string>('AUTH0_DB_CONNECTION');
  }


  async getManagementApiToken(): Promise<string> {
    if (this.managementApiToken) return this.managementApiToken;

    const response = await fetch(`https://${this.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        audience: `https://${this.AUTH0_DOMAIN}/api/v2/`,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new HttpException(
        error || 'Failed to get management API token',
        response.status,
      );
    }

    const data = await response.json();
    this.managementApiToken = data.access_token;
    return this.managementApiToken;
  }

  async createUser(token: string, email: string, password: string, name?: string): Promise<Auth0User> {
    const response = await fetch(
      `https://${this.AUTH0_DOMAIN}/api/v2/users`,
      {
        method: 'POST',
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          email,
          password,
          connection: 'Username-Password-Authentication',
          name,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new HttpException(error || 'Failed to create user', response.status);
    }

    return response.json();
  }

  async getUserByEmail(email: string, token: string): Promise<Auth0User | null> {
    const url = new URL(`https://${this.AUTH0_DOMAIN}/api/v2/users`);
    url.searchParams.append('q', `email:"${email}"`);
    url.searchParams.append('search_engine', 'v3');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new HttpException(error || 'Failed to fetch user', response.status);
    }

    const users = await response.json();
    return users.length > 0 ? users[0] : null;
  }
}