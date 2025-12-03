import { Controller, Post, Patch, Get, Delete, Param, Body, Request, UseGuards, Inject, forwardRef, Header } from '@nestjs/common';
import { UserAuthGuard } from '../security/guard/user-auth.guard';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ConfigsService } from './config.service';
import { SubscriptionService } from '../subscriptions/subscription.service';
import { Feature } from '../features/enums/feature.enum';
import { RequireFeature } from '../subscriptions/decorators/require-feature.decorator';
import { FeatureGuard } from '../subscriptions/guards/feature.guard';
import { UpdateConfigLayoutDto } from './dto/update-config-layout.dto';

@Controller('brands')
@UseGuards(UserAuthGuard)
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
    await this.subscriptionService.checkConfigLimit(req.user.auth0Id, parseInt(brandId), req.user.company);

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
  // @Header('Cache-Control', 'public, max-age=120, must-revalidate, immutable')
  async findAllConfigsForBrand(
    @Request() req,
    @Param('brandId') brandId: string,
  ) {
    // Check for limit violations
    const violations = await this.subscriptionService.checkLimitViolations(req.user.auth0Id);
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
  async getConfigVersions(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configDefinitionId') configDefinitionId: number,
  ) {
    return this.configsService.getConfigVersionsById(req.user.auth0Id, parseInt(brandId), configDefinitionId, req.user.company);
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
  @RequireFeature(Feature.CONFIG_VERSIONING)
  @UseGuards(FeatureGuard)
  async setActiveVersion(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configName') configName: string,
    @Body() body: { version: number },
  ) {
    return this.configsService.setActiveVersionByName(req.user.auth0Id, parseInt(brandId), configName, body.version, req.user.company);
  }

  @Patch(':brandId/configs/:configId/layout')
  updateConfigLayout(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configId') configId: string,
    @Body() dto: UpdateConfigLayoutDto,
  ) {
    return this.configsService.updateConfigLayout(
      req.user.auth0Id,
      parseInt(brandId),
      parseInt(configId),
      dto,
      req.user.company,
    );
  }

}