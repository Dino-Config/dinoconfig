import { Controller, Post, Patch, Get, Delete, Param, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../security/guard/jwt.guard';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ConfigsService } from './config.service';

@Controller('brands/:brandId/configs')
@UseGuards(JwtAuthGuard)
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @Post()
  create(
    @Request() req,
    @Param('brandId') brandId: string,
    @Body() dto: CreateConfigDto,
  ) {
    return this.configsService.create(req.user.id, parseInt(brandId), dto);
  }

  @Patch(':configId')
  update(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configId') configId: string,
    @Body() dto: UpdateConfigDto,
  ) {
    return this.configsService.update(req.user.id, parseInt(brandId), parseInt(configId), dto);
  }

  @Get(':configId')
  findOne(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configId') configId: string,
  ) {
    return this.configsService.findOne(req.user.id, parseInt(brandId), parseInt(configId));
  }

  @Delete(':configId')
  remove(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configId') configId: string,
  ) {
    return this.configsService.remove(req.user.id, parseInt(brandId), parseInt(configId));
  }

  @Get()
  findAllConfigsForBrand(
    @Request() req,
    @Param('brandId') brandId: string,
  ) {
    return this.configsService.findAllConfigsForBrand(req.user.id, parseInt(brandId));
  }
}