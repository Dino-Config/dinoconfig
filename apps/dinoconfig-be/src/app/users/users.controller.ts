import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, Req, UseGuards, NotFoundException, Header } from '@nestjs/common';
import { UsersService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../security/guard/jwt.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=300, must-revalidate, immutable')
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