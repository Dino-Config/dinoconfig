import { Controller, Post, Body, Get, HttpCode, Req, UseGuards, HttpException, HttpStatus, Res, Headers } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from '../service/auth.service';
import { TokenBlacklistService } from '../service/token-blacklist.service';
import { SdkAuthService } from '../service/sdk-auth.service';
import { UserAuthGuard } from '../guard/user-auth.guard';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/user.service';
import { ErrorMessages } from '../../constants/error-messages';
import * as jwt from 'jsonwebtoken';

/** Minimal shape of the Auth0 id_token payload used during login */
interface IdTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  email_verified?: boolean;
  'X-INTERNAL-COMPANY'?: string;
  'https://dinoconfig.com/company'?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, 
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly configService: ConfigService,
    private readonly sdkAuthService: SdkAuthService,
    private readonly usersService: UsersService,
  ) {}

  @Get('token')
  @HttpCode(200)
  async token() {
    const token = await this.authService.getManagementToken();
    return { access_token: token };
  }

  @Post('signup')
  async signup(
    @Req() req,
    @Body() body: { email: string; password: string; firstName: string; lastName: string; company: string },
  ) {
    return this.authService.createUser(body.email, body.password, body.firstName, body.lastName, body.company);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,) {
    const { email, password } = body;
    const authResponse = await this.authService.login(email, password);
    if (!authResponse) {
      throw new HttpException(ErrorMessages.AUTH.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    const { access_token, id_token, refresh_token } = authResponse;

    // Resolve user in DB before setting cookies - never allow login without a synced user
    if (!id_token) {
      throw new HttpException(
        ErrorMessages.AUTH.UNABLE_TO_COMPLETE_AUTH,
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    const decoded = jwt.decode(id_token) as IdTokenPayload | null;
    if (!decoded?.sub) {
      throw new HttpException(
        ErrorMessages.AUTH.UNABLE_TO_COMPLETE_AUTH,
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    const auth0Id = decoded.sub;
    let user = await this.usersService.findByAuth0Id(auth0Id);
    let auth0User: { email?: string; name?: string; email_verified?: boolean } | null = null;

    if (!user) {
      try {
        auth0User = await this.authService.getUserById(auth0Id);
        user = await this.usersService.createFromAuth0({
          user_id: auth0Id,
          email: decoded.email || auth0User.email,
          name: decoded.name || auth0User.name,
          company: decoded['X-INTERNAL-COMPANY'] || decoded['https://dinoconfig.com/company'] || null
        });
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          ErrorMessages.AUTH.UNABLE_TO_COMPLETE_AUTH,
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
    }

    // Update email verification status (best-effort, do not fail login). Reuse auth0User when we just fetched it.
    try {
      const freshAuth0 = auth0User ?? await this.authService.getUserById(auth0Id);
      const freshEmailVerified = freshAuth0.email_verified ?? false;
      if (user.emailVerified !== freshEmailVerified) {
        await this.usersService.updateEmailVerificationStatus(auth0Id, freshEmailVerified);
        user.emailVerified = freshEmailVerified;
      }
    } catch (error) {
      console.error('Failed to fetch email verification status from Auth0:', error);
      const emailVerified = decoded.email_verified ?? false;
      if (user.emailVerified !== emailVerified) {
        await this.usersService.updateEmailVerificationStatus(auth0Id, emailVerified);
        user.emailVerified = emailVerified;
      }
    }

    // Only set cookies after we have a synced user in the DB
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: this.configService.get<string>('AUTH_COOKIE_DOMAIN'),
      path: '/',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('id_token', id_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: this.configService.get<string>('AUTH_COOKIE_DOMAIN'),
      path: '/',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    if (refresh_token) {
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: this.configService.get<string>('AUTH_COOKIE_DOMAIN'),
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });
    }

    return {
      ...authResponse,
      user
    };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Extract tokens from cookies
    const accessToken = req.cookies['access_token'];
    const refreshToken = req.cookies['refresh_token'];

    // Blacklist the tokens if they exist
    if (accessToken) {
      await this.tokenBlacklistService.blacklistToken(accessToken, 'access', 'logout');
    }
    
    if (refreshToken) {
      await this.tokenBlacklistService.blacklistToken(refreshToken, 'refresh', 'logout');
    }

    // Clear cookies
    res.clearCookie('access_token', { 
      path: '/',
      domain: this.configService.get<string>('AUTH_COOKIE_DOMAIN'),
      secure: true,
      sameSite: 'none'
    });
    res.clearCookie('id_token', { 
      path: '/',
      domain: this.configService.get<string>('AUTH_COOKIE_DOMAIN'),
      secure: true,
      sameSite: 'none'
    });
    res.clearCookie('refresh_token', { 
      path: '/',
      domain: this.configService.get<string>('AUTH_COOKIE_DOMAIN'),
      secure: true,
      sameSite: 'none'
    });
    
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('send-verification')
  @UseGuards(UserAuthGuard)
  async sendVerification(@Req() req: Request, @Body() body: { userId: string }) {
    const { auth0Id } = req.user as any;
    
    const user = await this.authService['usersService'].findByAuth0Id(auth0Id);
    
    if (user.verificationEmailResendCount >= 3) {
      throw new HttpException(
        ErrorMessages.AUTHORIZATION.MAX_VERIFICATION_ATTEMPTS,
        HttpStatus.FORBIDDEN
      );
    }
    
    const result = await this.authService.sendEmailVerification(body.userId);
    
    await this.authService['usersService'].incrementVerificationResendCount(auth0Id);
    
    return result;
  }

  @Get('check-verification')
  @UseGuards(UserAuthGuard)
  async checkVerification(@Req() req: Request) {
    const { auth0Id } = req.user as any;
    const auth0User = await this.authService.getUserById(auth0Id);
    return { 
      emailVerified: auth0User.email_verified || false,
      email: auth0User.email 
    };
  }

  @Get('validate')
  @UseGuards(UserAuthGuard)
  async validate(@Res() res: Response) {
    return res.status(204).send();
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new HttpException(ErrorMessages.AUTH.NO_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    try {
      const newTokens = await this.authService.refreshToken(refreshToken);
      
      // Set new access token cookie
      res.cookie('access_token', newTokens.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: this.configService.get<string>('AUTH_COOKIE_DOMAIN'),
        path: '/',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      // Set new id token cookie if provided
      if (newTokens.id_token) {
        res.cookie('id_token', newTokens.id_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          domain: this.configService.get<string>('AUTH_COOKIE_DOMAIN'),
          path: '/',
          maxAge: 15 * 60 * 1000 // 15 minutes
        });
      }

      // Rotate refresh token if Auth0 provides a new one
      if (newTokens.refresh_token) {
        res.cookie('refresh_token', newTokens.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          domain: this.configService.get<string>('AUTH_COOKIE_DOMAIN'),
          path: '/',
          maxAge: 1 * 24 * 60 * 60 * 1000
        });
      }

      return {
        access_token: newTokens.access_token,
        id_token: newTokens.id_token,
        refresh_token: newTokens.refresh_token,
        expires_in: 900 // 15 minutes in seconds
      };
    } catch (error) {
      throw new HttpException(ErrorMessages.AUTH.INVALID_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Get SDK token (deprecated - kept for backward compatibility)
   */
  @Post('sdk-token')
  @UseGuards(UserAuthGuard)
  async sdkToken(@Req() req: Request) {
    return this.sdkAuthService.getSDKTokenFromRequest(req);
  }

  /**
   * Exchange API key for SDK token
   */
  @Post('sdk-token/exchange')
  @HttpCode(200)
  async exchangeApiKeyForToken(@Headers('x-api-key') apiKey: string) {
    if (!apiKey) {
      throw new HttpException(ErrorMessages.AUTH.API_KEY_REQUIRED, HttpStatus.UNAUTHORIZED);
    }

    return this.sdkAuthService.exchangeApiKeyForToken(apiKey);
  }
}