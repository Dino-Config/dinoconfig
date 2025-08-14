// configs.controller.ts
import { Controller, Post, Patch, Get, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ConfigsService } from './config.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';

@Controller('brands/:brandId/configs')
export class ConfigsController {
  constructor(private configsService: ConfigsService) {}

  @Post()
  create(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Body() dto: CreateConfigDto
  ) {
    return this.configsService.create(brandId, dto);
  }

  @Patch(':configKey')
  update(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Param('configKey') configKey: string,
    @Body() dto: UpdateConfigDto
  ) {
    return this.configsService.update(brandId, configKey, dto);
  }

  @Get(':configKey/latest')
  getLatest(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Param('configKey') configKey: string
  ) {
    return this.configsService.findLatest(brandId, configKey);
  }

  @Get(':configKey/versions')
  getVersions(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Param('configKey') configKey: string
  ) {
    return this.configsService.findAllVersions(brandId, configKey);
  }
}