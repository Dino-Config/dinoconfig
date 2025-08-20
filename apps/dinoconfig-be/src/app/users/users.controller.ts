import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../security/guard/jwt.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUser(@Req() req) {
    const { sub } = req.user;
    return this.usersService.findByAuth0Id(sub);
  }

  @Patch()
  async updateUser(@Req() req, @Body() dto: UpdateUserDto) {
    const { sub } = req.user;
    return this.usersService.updateByAuth0Id(sub, dto);
  }

  @Delete()
  async deleteUser(@Req() req) {
    const { sub } = req.user;
    return this.usersService.removeByAuth0Id(sub);
  }
}