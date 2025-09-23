import { Controller, Post, Body, Get, Query, HttpCode, Req, UseGuards, HttpException, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../guard/jwt.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

  @Get('token')
  @HttpCode(200)
  async token() {
    const token = await this.authService.getManagementToken();
    return { access_token: token };
  }

  @Post('signup')
  async signup(
    @Req() req,
    @Body() body: { email: string; password: string; name?: string; company?: string },
  ) {
    return this.authService.createUser(body.email, body.password, body.name, body.company);
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

     const { access_token, id_token } = user;

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
    return user;
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('id_token', { path: '/' });
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
  @UseGuards(JwtAuthGuard)
  async validate(@Res() res: Response) {
    return res.status(204).send();
  }
}