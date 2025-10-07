import { Injectable, HttpException, HttpStatus, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/user.service';

interface Auth0User {
  user_id: string;
  email: string;
  name?: string;
  app_metadata?: Record<string, any>;
}

interface Auth0LoginResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
  id_token?: string;
  refresh_token?: string;
}

@Injectable()
export class AuthService {
  private managementApiToken: string;

  private AUTH0_DOMAIN: string;
  private CLIENT_ID: string;
  private CLIENT_SECRET: string;
  private DB_CONNECTION: string;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService) {
    this.AUTH0_DOMAIN = this.configService.get<string>('AUTH0_DOMAIN');
    this.CLIENT_ID = this.configService.get<string>('AUTH0_M2M_CLIENT_ID');
    this.CLIENT_SECRET = this.configService.get<string>('AUTH0_M2M_CLIENT_SECRET');
    this.DB_CONNECTION = this.configService.get<string>('AUTH0_DB_CONNECTION');
  }


  // Get Auth0 Management API token
  async getManagementToken(): Promise<string> {
    const res = await fetch(`https://${this.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        audience: `https://${this.AUTH0_DOMAIN}/api/v2/`,
        grant_type: 'client_credentials',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new HttpException(err || 'Failed to get management token', res.status);
    }

    const data = await res.json();
    return data.access_token;
  }

  private async deleteAuth0User(userId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`https://${this.AUTH0_DOMAIN}/api/v2/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(`Failed to delete Auth0 user ${userId}:`, await response.text());
      }
    } catch (error) {
      console.error(`Error deleting Auth0 user ${userId}:`, error);
    }
  }

  async createUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    company: string
  ): Promise<Auth0User> {
    const token = await this.getManagementToken();

    // Combine firstName and lastName for Auth0's name field
    const name = `${firstName} ${lastName}`.trim();

    const response = await fetch(`https://${this.AUTH0_DOMAIN}/api/v2/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connection: this.DB_CONNECTION,
        email,
        password,
        name,
        app_metadata: { company },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new HttpException(error || 'Failed to create user', response.status);
    }

    const auth0User: Auth0User = await response.json();

    try {
      await this.usersService.createFromAuth0({
        user_id: auth0User.user_id,
        email: auth0User.email,
        name: name, // Use the combined name we created
        company: company,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        await this.deleteAuth0User(auth0User.user_id, token);
        throw error;
      }
      throw error;
    }

    return auth0User;
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

  async login(email: string, password: string): Promise<Auth0LoginResponse> {
    const res = await fetch(`https://${this.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'password',
        username: email,
        password,
        audience: this.configService.get('AUTH0_AUDIENCE'),
        client_id: this.configService.get('AUTH0_CLIENT_ID'),
        client_secret: this.configService.get('AUTH0_CLIENT_SECRET'),
        scope: 'openid profile email offline_access',
      }),
    });
  
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new HttpException(err || 'Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  
    return res.json();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(`https://${this.AUTH0_DOMAIN}/dbconnections/change_password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.configService.get<string>('AUTH0_CLIENT_ID'),
        email,
        connection: this.DB_CONNECTION,
      }),
    });
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new HttpException(error || 'Failed to send reset password email', response.status);
    }
  

    const message = await response.text();
    return { message };
  }

  async sendEmailVerification(userId: string): Promise<{ jobId: string }> {
    const token = await this.getManagementToken();
  
    const response = await fetch(`https://${this.AUTH0_DOMAIN}/api/v2/jobs/verification-email`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        client_id: this.configService.get<string>('AUTH0_CLIENT_ID'),
      }),
    });
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new HttpException(error || 'Failed to send verification email', response.status);
    }
  
    const data = await response.json();
    return { jobId: data.id };
  }

  async refreshToken(refreshToken: string): Promise<Auth0LoginResponse> {
    const response = await fetch(`https://${this.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.configService.get('AUTH0_CLIENT_ID'),
        client_secret: this.configService.get('AUTH0_CLIENT_SECRET'),
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new HttpException(error || 'Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }

    return response.json();
  }
}