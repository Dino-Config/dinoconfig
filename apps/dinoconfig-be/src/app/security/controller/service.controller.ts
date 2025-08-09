import { Controller, Post, Body, Get, Query, HttpCode, Req, UseGuards } from '@nestjs/common';
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

  @Get('login')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async login(@Query('email') email: string, @Req() req) {
    const user = await this.authService.getUserByEmail(email, req.headers.authorization);
    if (!user) {
      return { message: 'User not found' };
    }
    return user;
  }
}