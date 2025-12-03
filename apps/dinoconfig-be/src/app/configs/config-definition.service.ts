import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigDefinition } from './entities/config-definition.entity';
import { Config } from './entities/config.entity';
import { ActiveVersion } from './entities/active-version.entity';
import { Brand } from '../brands/entities/brand.entity';

@Injectable()
export class ConfigDefinitionService {
  constructor(
    @InjectRepository(ConfigDefinition)
    private readonly configDefinitionRepo: Repository<ConfigDefinition>,
    @InjectRepository(Config) private readonly configRepo: Repository<Config>,
    @InjectRepository(ActiveVersion)
    private readonly activeVersionRepo: Repository<ActiveVersion>,
  ) {}

  /**
   * Syncs associations between a definition and its related configs and active versions
   */
  async syncDefinitionAssociations(
    definition: ConfigDefinition,
    brand: Brand,
    company: string,
  ): Promise<void> {
    const configs = await this.configRepo.find({
      where: {
        brand: { id: brand.id },
        definition: { id: definition.id },
      },
    });

    const configsToUpdate: Config[] = [];

    for (const config of configs) {
      if (!config.definition || config.definition.id !== definition.id) {
        config.definition = { id: definition.id } as ConfigDefinition;
        configsToUpdate.push(config);
      }
    }

    if (configsToUpdate.length > 0) {
      await this.configRepo.save(configsToUpdate);
    }

    const activeVersions = await this.activeVersionRepo.find({
      where: {
        brand: { id: brand.id },
        configDefinition: { id: definition.id },
        company,
      },
    });

    const activeVersionsToUpdate: ActiveVersion[] = [];

    for (const activeVersion of activeVersions) {
      if (
        !activeVersion.configDefinition ||
        activeVersion.configDefinition.id !== definition.id ||
        activeVersion.configName !== definition.name
      ) {
        activeVersion.configDefinition = definition;
        activeVersion.configName = definition.name;
        activeVersionsToUpdate.push(activeVersion);
      }
    }

    if (activeVersionsToUpdate.length > 0) {
      await this.activeVersionRepo.save(activeVersionsToUpdate);
    }
  }

  /**
   * Gets or creates a config definition for a brand
   */
  async getOrCreateDefinition(
    brand: Brand,
    name: string,
    company: string,
  ): Promise<ConfigDefinition> {
    const trimmedName = name.trim();

    let definition = await this.configDefinitionRepo.findOne({
      where: {
        brand: { id: brand.id },
        name: trimmedName,
        company,
      },
    });

    if (!definition) {
      definition = this.configDefinitionRepo.create({
        brand,
        name: trimmedName,
        company,
      });

      definition = await this.configDefinitionRepo.save(definition);
    }

    await this.syncDefinitionAssociations(definition, brand, company);
    return definition;
  }

  /**
   * Creates a new config definition
   */
  async create(
    userId: string,
    brandId: number,
    name: string,
    company: string,
    brand: Brand,
  ): Promise<ConfigDefinition> {
    return this.getOrCreateDefinition(brand, name, company);
  }

  /**
   * Updates the name of a config definition
   */
  async updateName(
    definitionId: number,
    newName: string,
    brand: Brand,
    company: string,
  ): Promise<ConfigDefinition> {
    const definition = await this.configDefinitionRepo.findOne({
      where: {
        id: definitionId,
        brand: { id: brand.id },
        company,
      },
    });

    if (!definition) {
      throw new NotFoundException(
        `Config definition with ID "${definitionId}" not found`,
      );
    }

    const trimmedName = newName.trim();
    if (trimmedName === definition.name) {
      return definition;
    }

    // Check for name conflicts
    const conflictingDefinition = await this.configDefinitionRepo.findOne({
      where: {
        brand: { id: brand.id },
        name: trimmedName,
        company,
      },
    });

    if (conflictingDefinition && conflictingDefinition.id !== definition.id) {
      throw new ConflictException(`Config with name "${trimmedName}" already exists`);
    }

    // Update definition name
    definition.name = trimmedName;
    const updatedDefinition = await this.configDefinitionRepo.save(definition);
    await this.syncDefinitionAssociations(updatedDefinition, brand, company);

    return updatedDefinition;
  }

  /**
   * Gets a config definition by ID
   */
  async findOne(
    definitionId: number,
    brand: Brand,
    company: string,
  ): Promise<ConfigDefinition> {
    const definition = await this.configDefinitionRepo.findOne({
      where: {
        id: definitionId,
        brand: { id: brand.id },
        company,
      },
    });

    if (!definition) {
      throw new NotFoundException(
        `Config definition with ID "${definitionId}" not found`,
      );
    }

    return definition;
  }

  /**
   * Gets all config definitions for a brand
   */
  async findAll(brandId: number, userId: string, company: string): Promise<ConfigDefinition[]> {
    return this.configDefinitionRepo.find({
      where: {
        brand: { id: brandId, user: { auth0Id: userId } },
        company,
      },
    });
  }

  /**
   * Deletes a config definition and all its associated configs (cascade delete)
   */
  async remove(
    definitionId: number,
    brand: Brand,
    company: string,
  ): Promise<void> {
    const definition = await this.configDefinitionRepo.findOne({
      where: {
        id: definitionId,
        brand: { id: brand.id },
        company,
      },
    });

    if (!definition) {
      throw new NotFoundException(
        `Config definition with ID "${definitionId}" not found`,
      );
    }

    // Cascading delete will handle configs and active versions
    await this.configDefinitionRepo.remove(definition);
  }
}

