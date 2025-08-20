import { Controller, Post, Patch, Get, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../security/guard/jwt.guard';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ConfigsService } from './config.service';

@Controller('configs')
@UseGuards(JwtAuthGuard)
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateConfigDto) {
    return this.configsService.create(req.user.sub, dto);
  }

  @Patch(':configKey')
  async update(@Req() req, @Param('configKey') configKey: string, @Body() dto: UpdateConfigDto) {
    return this.configsService.update(req.user.sub, configKey, dto);
  }

  @Get(':configKey/latest')
  async getLatest(@Req() req, @Param('configKey') configKey: string) {
    return this.configsService.findLatest(req.user.sub, configKey);
  }

  @Get(':configKey/versions')
  async getVersions(@Req() req, @Param('configKey') configKey: string) {
    return this.configsService.findAllVersions(req.user.sub, configKey);
  }
}
