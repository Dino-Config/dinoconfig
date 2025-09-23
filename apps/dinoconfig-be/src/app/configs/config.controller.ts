import { Controller, Post, Patch, Get, Param, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../security/guard/jwt.guard';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ConfigsService } from './config.service';

@Controller('brands/:brandName/configs')
@UseGuards(JwtAuthGuard)
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @Post()
  create(
    @Request() req,
    @Param('brandName') brandName: string,
    @Body() dto: CreateConfigDto,
  ) {
    return this.configsService.create(req.user.id, brandName, dto);
  }

  @Post(':configKey')
  update(
    @Request() req,
    @Param('brandName') brandName: string,
    @Param('configKey') configKey: string,
    @Body() dto: UpdateConfigDto,
  ) {
    return this.configsService.update(req.user.id, brandName, configKey, dto);
  }

  @Get(':configKey')
  findLatest(
    @Request() req,
    @Param('brandName') brandName: string,
    @Param('configKey') configKey: string,
  ) {
    return this.configsService.findLatest(req.user.id, brandName, configKey);
  }

  @Get(':configKey/versions')
  findAllVersions(
    @Request() req,
    @Param('brandName') brandName: string,
    @Param('configKey') configKey: string,
  ) {
    return this.configsService.findAllVersions(req.user.id, brandName, configKey);
  }

  @Get('/keys')
  findAllKeys(
    @Request() req,
    @Param('brandName') brandName: string,
  ) {
    return this.configsService.findAllKeys(req.user.id, brandName);
  }
}