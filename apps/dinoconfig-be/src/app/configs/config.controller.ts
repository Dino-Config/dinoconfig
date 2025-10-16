import { Controller, Post, Patch, Get, Delete, Param, Body, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../security/guard/jwt.guard';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ConfigsService } from './config.service';
import { brandHeaderExtractor } from '../security/jwt-extractor';
import { Scopes } from '../security/decorators/scope.decorator';
import { ScopesGuard } from '../security/guard/scope.guard';

@Controller('brands/:brandId/configs')
@UseGuards(JwtAuthGuard)
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @Post()
  create(
    @Request() req,
    @Param('brandId') brandId: string,
    @Body() dto: CreateConfigDto) {
    const company = brandHeaderExtractor(req);
    if (!company) {
      throw new UnauthorizedException('X-INTERNAL-COMPANY header is required');
    }

    return this.configsService.create(req.user.auth0Id, parseInt(brandId), dto, company);
  }

  @Patch(':configId')
  update(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configId') configId: string,
    @Body() dto: UpdateConfigDto,
  ) {
    return this.configsService.update(req.user.auth0Id, parseInt(brandId), parseInt(configId), dto);
  }

  @Get(':configId')
  findOne(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configId') configId: string,
  ) {
    const company = brandHeaderExtractor(req);
    if (!company) {
      throw new UnauthorizedException('X-INTERNAL-COMPANY header is required');
    }

    return this.configsService.findOneByBrandAndCompanyId(req.user.auth0Id, parseInt(brandId), parseInt(configId), company);
  }

  @Delete(':configId')
  remove(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configId') configId: string,
  ) {
    return this.configsService.remove(req.user.auth0Id, parseInt(brandId), parseInt(configId));
  }

  @Get()
  findAllConfigsForBrand(
    @Request() req,
    @Param('brandId') brandId: string,
  ) {
    const company = brandHeaderExtractor(req);
    if (!company) {
      throw new UnauthorizedException('X-INTERNAL-COMPANY header is required');
    }


    return this.configsService.findAllConfigsForBrand(req.user.auth0Id, parseInt(brandId), company);
  }
}