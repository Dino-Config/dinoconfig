import { Controller, Get, Param, Request, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { MachineAuthGuard } from '../security/guard/machine-auth.guard';
import { ScopesGuard } from '../security/guard/scope.guard';
import { Scopes } from '../security/decorators/scope.decorator';
import { ConfigsService } from './config.service';
import { BrandsService } from '../brands/brand.service';
import {
  BrandListResponseDto,
  ConfigListResponseDto,
  ConfigDetailResponseDto,
  ConfigSchemaResponseDto,
  IntrospectionResponseDto,
} from './dto/sdk-discovery.dto';

@Controller('sdk')
@UseGuards(MachineAuthGuard, ScopesGuard)
export class SdkConfigsController {
  constructor(
    private readonly configsService: ConfigsService,
    @Inject(forwardRef(() => BrandsService))
    private readonly brandsService: BrandsService,
  ) {}

  /**
   * List all brands accessible by this API key
   * GET /api/sdk/brands
   */
  @Get('brands')
  @Scopes('read:brands')
  async listBrands(@Request() req): Promise<BrandListResponseDto> {
    return this.brandsService.listBrandsForSDK(req.user?.company);
  }

  /**
   * List all configs for a brand
   * GET /api/sdk/brands/:brandName/configs
   */
  @Get('brands/:brandName/configs')
  @Scopes('read:configs')
  async listConfigs(
    @Param('brandName') brandName: string,
    @Request() req,
  ): Promise<ConfigListResponseDto> {
    return this.configsService.findAllForBrandSdk(brandName, req.user?.company);
  }

  /**
   * Get full config with all values
   * GET /api/sdk/brands/:brandName/configs/:configName
   */
  @Get('brands/:brandName/configs/:configName')
  @Scopes('read:configs')
  async getConfig(
    @Param('brandName') brandName: string,
    @Param('configName') configName: string,
    @Request() req,
  ): Promise<ConfigDetailResponseDto> {
    return this.configsService.findByNameForSdk(brandName, configName, req.user?.company);
  }

  /**
   * Get config schema/structure
   * GET /api/sdk/brands/:brandName/configs/:configName/schema
   */
  @Get('brands/:brandName/configs/:configName/schema')
  @Scopes('read:configs')
  async getConfigSchema(
    @Param('brandName') brandName: string,
    @Param('configName') configName: string,
    @Request() req,
  ): Promise<ConfigSchemaResponseDto> {
    return this.configsService.getSchemaForSdk(brandName, configName, req.user?.company);
  }

  /**
   * Full introspection - all brands, configs, keys
   * GET /api/sdk/introspect
   */
  @Get('introspect')
  @Scopes('read:configs', 'read:brands')
  async introspect(@Request() req): Promise<IntrospectionResponseDto> {
    return this.configsService.introspectForSDK(req.user?.company);
  }

  /**
   * Get single config value (existing endpoint)
   * GET /api/sdk/brands/:brandName/configs/:name/:valueKey
   */
  @Get('brands/:brandName/configs/:name/:valueKey')
  @Scopes('read:configs')
  findConfigByNameAndValue(
    @Request() req,
    @Param('brandName') brandName: string,
    @Param('name') name: string,
    @Param('valueKey') valueKey: string,
  ) {
    return this.configsService.findConfigByNameAndValueForSDK(
      brandName,
      name,
      valueKey,
      req.user?.company,
    );
  }
}
