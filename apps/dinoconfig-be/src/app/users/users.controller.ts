import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  UseGuards,
  NotFoundException,
  Header,
  Logger,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserAuthGuard } from '../security/guard/user-auth.guard';
import { LogContextGuard } from '../logging';
import { AuthService } from '../security/service/auth.service';
import { ErrorMessages } from '../constants/error-messages';

@Controller('users')
@UseGuards(UserAuthGuard, LogContextGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

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
      try {
        user = await this.usersService.createFromAuth0({
          user_id: auth0Id,
          email: email,
          name: name,
          company: company
        });
        this.logger.log({ message: 'User created from Auth0', auth0Id, email });
      } catch (error) {
        this.logger.warn({ message: 'Failed to create user from Auth0', auth0Id, error: (error as Error)?.message });
        throw new NotFoundException(ErrorMessages.AUTH.UNABLE_TO_COMPLETE_AUTH);
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
      this.logger.error({
        message: 'Failed to fetch email verification status from Auth0',
        auth0Id,
        error: (error as Error)?.message,
      });

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