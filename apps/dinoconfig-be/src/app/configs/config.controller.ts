import { Controller, Post, Patch, Get, Delete, Param, Body, Request, UseGuards, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtAuthGuard } from '../security/guard/jwt.guard';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ConfigsService } from './config.service';
import { brandHeaderExtractor } from '../security/jwt-extractor';
import { SubscriptionService } from '../subscriptions/subscription.service';
import { Scopes } from '../security/decorators/scope.decorator';
import { ScopesGuard } from '../security/guard/scope.guard';

@Controller('brands')
@UseGuards(JwtAuthGuard)
export class ConfigsController {
  constructor(
    private readonly configsService: ConfigsService,
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService
  ) {}

  @Post(':brandId/configs')
  async create(
    @Request() req,
    @Param('brandId') brandId: string,
    @Body() dto: CreateConfigDto) {
    const company = brandHeaderExtractor(req);
    if (!company) {
      throw new UnauthorizedException('X-INTERNAL-COMPANY header is required');
    }

    // Check if user has reached config limit for this brand
    await this.subscriptionService.checkConfigLimit(req.user.id, parseInt(brandId));

    return this.configsService.create(req.user.auth0Id, parseInt(brandId), dto, company);
  }

  @Patch(':brandId/configs/:configId')
  update(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configId') configId: string,
    @Body() dto: UpdateConfigDto,
  ) {
    return this.configsService.update(req.user.auth0Id, parseInt(brandId), parseInt(configId), dto);
  }

  @Get(':brandId/configs/:configId')
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

  @Delete(':brandId/configs/:configId')
  remove(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configId') configId: string,
  ) {
    return this.configsService.remove(req.user.auth0Id, parseInt(brandId), parseInt(configId));
  }

  @Get(':brandId/configs')
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

  @Get(':brandName/configs/:name/:valueKey')
  @UseGuards(ScopesGuard)
  @Scopes('read:configs')
  findConfigByNameAndValue(
    @Request() req,
    @Param('brandName') brandName: string,
    @Param('name') name: string,
    @Param('valueKey') valueKey: string,
  ) {
    return this.configsService.findConfigByNameAndValue(req.user.auth0Id, brandName, name, valueKey, req.user?.company);
  }
}