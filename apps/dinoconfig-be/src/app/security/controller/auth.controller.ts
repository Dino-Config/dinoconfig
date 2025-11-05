import { Controller, Post, Body, Get, HttpCode, Req, UseGuards, HttpException, HttpStatus, Res, Headers } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from '../service/auth.service';
import { TokenBlacklistService } from '../service/token-blacklist.service';
import { SdkAuthService } from '../service/sdk-auth.service';
import { UserAuthGuard } from '../guard/user-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, 
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly configService: ConfigService,
    private readonly sdkAuthService: SdkAuthService,
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
    const user = await this.authService.login(email, password);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

     const { access_token, id_token, refresh_token } = user;

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: this.configService.get<string>('AUTH_COOKIE_DOMAIN'),
      path: '/',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('id_token', id_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: this.configService.get<string>('AUTH_COOKIE_DOMAIN'),
      path: '/',
      maxAge: 15 * 60 * 1000
    });

    // Set refresh token with longer expiration (7 days)
    if (refresh_token) {
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: this.configService.get<string>('AUTH_COOKIE_DOMAIN'),
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }

    return user;
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
  async sendVerification(@Body() body: { userId: string }) {
    return this.authService.sendEmailVerification(body.userId);
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
      throw new HttpException('No refresh token provided', HttpStatus.UNAUTHORIZED);
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

      return {
        access_token: newTokens.access_token,
        id_token: newTokens.id_token,
        expires_in: 900 // 15 minutes in seconds
      };
    } catch (error) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
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
      throw new HttpException('API key is required', HttpStatus.UNAUTHORIZED);
    }

    return this.sdkAuthService.exchangeApiKeyForToken(apiKey);
  }
}