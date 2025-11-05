import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { UserAuthGuard } from './security/guard/user-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('me')
  @UseGuards(UserAuthGuard)
  getMe(@Req() req) {
    // UserAuthGuard ensures user.auth0Id exists, so this is a user token
    return req.user;
  }
}
