import { Controller, Post, Body, Get, Query, HttpCode, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('token')
  @HttpCode(200)
  async token() {
    const token = await this.authService.getManagementApiToken();
    return { access_token: token };
  }

  @Post('signup')
  @UseGuards(JwtAuthGuard)
  async signup(
    @Req() req,
    @Body() body: { email: string; password: string; name?: string },
  ) {
    return this.authService.createUser(req.headers.authorization, body.email, body.password, body.name);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    const user = await this.authService.login(email, password);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('send-verification')
  async sendVerification(@Body() body: { userId: string }) {
    return this.authService.sendEmailVerification(body.userId);
  }
}