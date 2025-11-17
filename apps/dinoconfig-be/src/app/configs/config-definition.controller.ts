import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UserAuthGuard } from '../security/guard/user-auth.guard';
import { ConfigDefinitionService } from './config-definition.service';
import { BrandsService } from '../brands/brand.service';
import { ConfigsService } from './config.service';
import { UsersService } from '../users/user.service';

@Controller('brands')
@UseGuards(UserAuthGuard)
export class ConfigDefinitionController {
  constructor(
    private readonly configDefinitionService: ConfigDefinitionService,
    private readonly brandsService: BrandsService,
    private readonly configsService: ConfigsService,
    private readonly usersService: UsersService,
  ) {}

  private async getBrandForUser(userId: string, brandId: number) {
    const user = await this.usersService.findByAuth0Id(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const brand = await this.brandsService.findByIdAndUser(brandId, user.id);
    if (!brand) {
      throw new NotFoundException(`Brand with ID "${brandId}" not found`);
    }
    return brand;
  }

  /**
   * Get all config definitions for the sidebar
   * Returns definitions with their latest/active config info
   */
  @Get(':brandId/config-definitions')
  async findAll(
    @Request() req,
    @Param('brandId') brandId: string,
  ) {
    const brand = await this.getBrandForUser(req.user.auth0Id, parseInt(brandId));
    const definitions = await this.configDefinitionService.findAll(brand, req.user.company);
    
    // Load active config for each definition to return as Config objects for compatibility
    const configsWithDefinitions = await Promise.all(
      definitions.map(async (def) => {
        try {
          const activeConfig = await this.configsService.getActiveConfig(
            req.user.auth0Id,
            parseInt(brandId),
            def.name,
            req.user.company,
          );
          return activeConfig || null;
        } catch {
          return null;
        }
      })
    );

    // Filter out nulls and return as Config array (with virtual properties)
    return configsWithDefinitions.filter((c): c is NonNullable<typeof c> => c !== null);
  }

  /**
   * Update config definition name via config ID
   * This is used when renaming from the config editor
   */
  @Patch(':brandId/configs/:configId/name')
  async updateConfigName(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configId') configId: string,
    @Body() dto: { name: string },
  ) {
    const config = await this.configsService.findOneByBrandAndCompanyId(
      req.user.auth0Id,
      parseInt(brandId),
      parseInt(configId),
      req.user.company,
    );

    if (!config.definition) {
      throw new NotFoundException('Config definition not found');
    }

    const brand = await this.getBrandForUser(req.user.auth0Id, parseInt(brandId));

    await this.configDefinitionService.updateName(
      config.definition.id,
      dto.name,
      brand,
      req.user.company,
    );

    // Reload config with updated definition
    const reloadedConfig = await this.configsService.findOneByBrandAndCompanyId(
      req.user.auth0Id,
      parseInt(brandId),
      parseInt(configId),
      req.user.company,
    );

    return reloadedConfig;
  }

  /**
   * Delete a config definition and all its configs
   * Can be called via definition ID (from sidebar) or config ID (from config editor)
   */
  @Delete(':brandId/config-definitions/:definitionId')
  async remove(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('definitionId') definitionId: string,
  ) {
    const brand = await this.getBrandForUser(req.user.auth0Id, parseInt(brandId));
    await this.configDefinitionService.remove(
      parseInt(definitionId),
      brand,
      req.user.company,
    );
    return { message: 'Config definition deleted successfully' };
  }

  /**
   * Delete a config definition via config ID
   * This is used when deleting from the config editor
   */
  @Delete(':brandId/configs/:configId/definition')
  async removeByConfigId(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configId') configId: string,
  ) {
    const config = await this.configsService.findOneByBrandAndCompanyId(
      req.user.auth0Id,
      parseInt(brandId),
      parseInt(configId),
      req.user.company,
    );

    if (!config.definition) {
      throw new NotFoundException('Config definition not found');
    }

    const brand = await this.getBrandForUser(req.user.auth0Id, parseInt(brandId));
    await this.configDefinitionService.remove(
      config.definition.id,
      brand,
      req.user.company,
    );
    return { message: 'Config definition deleted successfully' };
  }
}

