import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, Req, UseGuards, NotFoundException, Header } from '@nestjs/common';
import { UsersService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserAuthGuard } from '../security/guard/user-auth.guard';
import { AuthService } from '../security/service/auth.service';

@Controller('users')
@UseGuards(UserAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  @Get()
  @Header('Cache-Control', 'no-cache')
  async getUser(@Req() req) {
    const { auth0Id, email, name, company } = req.user;
    let user = await this.usersService.findByAuth0Id(auth0Id);
    
    if (!user) {
      // User exists in Auth0 but not in database, create them
      try {
        user = await this.usersService.createFromAuth0({
          user_id: auth0Id,
          email: email,
          name: name,
          company: company
        });
      } catch (error) {
        throw new NotFoundException('User not found in database and could not be created. Please contact support.');
      }
    }
    
    try {
      const auth0User = await this.authService.getUserById(auth0Id);
      const freshEmailVerified = auth0User.email_verified || false;
      
      if (user.emailVerified !== freshEmailVerified) {
        await this.usersService.updateEmailVerificationStatus(auth0Id, freshEmailVerified);
        user.emailVerified = freshEmailVerified;
      }
    } catch (error) {
      console.error('Failed to fetch email verification status from Auth0:', error);

      const emailVerified = req.user.emailVerified || false;
      if (user.emailVerified !== emailVerified) {
        await this.usersService.updateEmailVerificationStatus(auth0Id, emailVerified);
        user.emailVerified = emailVerified;
      }
    }
    
    return user;
  }

  @Patch()
  async updateUser(@Req() req, @Body() dto: UpdateUserDto) {
    const { auth0Id } = req.user;
    return this.usersService.updateByAuth0Id(auth0Id, dto);
  }

  @Delete()
  async deleteUser(@Req() req) {
    const { auth0Id } = req.user;
    return this.usersService.removeByAuth0Id(auth0Id);
  }
}