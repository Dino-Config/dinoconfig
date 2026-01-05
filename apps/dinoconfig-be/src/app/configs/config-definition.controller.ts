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
import { UpdateConfigDefinitionDto } from './dto/update-config-definition.dto';
import { ErrorMessages } from '../constants/error-messages';

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
      throw new NotFoundException(ErrorMessages.AUTH.AUTHENTICATION_FAILED);
    }
    const brand = await this.brandsService.findByIdAndUser(brandId, user.id);
    if (!brand) {
      throw new NotFoundException(ErrorMessages.BRAND.NOT_FOUND(brandId));
    }
    return brand;
  }

  /**
   * Get all config definitions for the sidebar
   * Returns only definition info (id, name) - no config data loaded
   * Config data is loaded on demand when a specific config is selected
   */
  @Get(':brandId/config-definitions')
  async findAll(
    @Request() req,
    @Param('brandId') brandId: string,
  ) {
    return await this.configDefinitionService.findAll(parseInt(brandId), req.user.auth0Id, req.user.company);
  }

  /**
   * Update config definition by definition ID (partial update)
   */
  @Patch(':brandId/config-definitions/:configDefinitionId')
  async updateConfigDefinition(
    @Request() req,
    @Param('brandId') brandId: string,
    @Param('configDefinitionId') configDefinitionId: string,
    @Body() dto: UpdateConfigDefinitionDto,
  ) {
    const brand = await this.getBrandForUser(req.user.auth0Id, parseInt(brandId));

    const updatedDefinition = await this.configDefinitionService.update(
      parseInt(configDefinitionId),
      dto,
      brand,
      req.user.company,
    );

    // Return updated definition in the same format as findAll
    return {
      id: updatedDefinition.id,
      name: updatedDefinition.name,
      definition: {
        id: updatedDefinition.id,
        name: updatedDefinition.name,
        company: updatedDefinition.company,
      },
      company: updatedDefinition.company,
    };
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
      throw new NotFoundException(ErrorMessages.CONFIG.DEFINITION_NOT_FOUND);
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

