import { Controller, Post, Patch, Get, Delete, Param, Body, Request, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { JwtAuthGuard } from '../security/guard/jwt.guard';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ConfigsService } from './config.service';
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
    // Check if user has reached config limit for this brand
    await this.subscriptionService.checkConfigLimit(req.user.id, parseInt(brandId), req.user.company);

    return this.configsService.create(req.user.auth0Id, parseInt(brandId), dto, req.user.company);
  }

  @Patch(':brandId/configs/:configId')
  update(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configId') configId: string,
    @Body() dto: UpdateConfigDto,
  ) {
    return this.configsService.update(req.user.auth0Id, parseInt(brandId), parseInt(configId), dto, req.user.company);
  }

  @Get(':brandId/configs/:configId')
  findOne(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configId') configId: string,
  ) {
    return this.configsService.findOneByBrandAndCompanyId(req.user.auth0Id, parseInt(brandId), parseInt(configId), req.user.company);
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
  async findAllConfigsForBrand(
    @Request() req,
    @Param('brandId') brandId: string,
  ) {
    // Check for limit violations
    const violations = await this.subscriptionService.checkLimitViolations(req.user.id);
    if (violations.hasViolations) {
      // Return configs with violation info
      const configs = await this.configsService.findAllConfigsForBrand(req.user.auth0Id, parseInt(brandId), req.user.company);
      return {
        configs,
        limitViolations: violations
      };
    }
    return this.configsService.findAllConfigsForBrand(req.user.auth0Id, parseInt(brandId), req.user.company);
  }

  @Get(':brandId/configs/:configId/versions')
  getConfigVersions(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configId') configId: number,
  ) {
    return this.configsService.getConfigVersionsById(req.user.auth0Id, parseInt(brandId), configId, req.user.company);
  }

  @Get(':brandId/configs/:configName/active')
  getActiveConfig(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configName') configName: string,
  ) {
    return this.configsService.getActiveConfig(req.user.auth0Id, parseInt(brandId), configName, req.user.company);
  }

  @Patch(':brandId/configs/:configName/active-version')
  setActiveVersion(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configName') configName: string,
    @Body() body: { version: number },
  ) {
    return this.configsService.setActiveVersionByName(req.user.auth0Id, parseInt(brandId), configName, body.version, req.user.company);
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