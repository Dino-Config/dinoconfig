import { ConflictException, Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './entities/config.entity';
import { ActiveVersion } from './entities/active-version.entity';
import { Brand } from '../brands/entities/brand.entity';
import { ConfigDefinition } from './entities/config-definition.entity';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { UpdateConfigResponseDto } from './dto/update-config-response.dto';
import { SubscriptionService } from '../subscriptions/subscription.service';
import { Feature } from '../features/enums/feature.enum';
import { ConfigDefinitionService } from './config-definition.service';
import { UpdateConfigLayoutDto } from './dto/update-config-layout.dto';

@Injectable()
export class ConfigsService {
  constructor(
    @InjectRepository(Config) private readonly configRepo: Repository<Config>,
    @InjectRepository(ActiveVersion) private readonly activeVersionRepo: Repository<ActiveVersion>,
    @InjectRepository(ConfigDefinition) private readonly configDefinitionRepo: Repository<ConfigDefinition>,
    @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
    private readonly subscriptionService: SubscriptionService,
    @Inject(forwardRef(() => ConfigDefinitionService))
    private readonly configDefinitionService: ConfigDefinitionService,
  ) {}

  /**
   * Adds virtual properties (name, company) from definition to config entity
   * Since definition is eager, it should always be loaded
   */
  private withVirtualProperties(config: Config | null): Config | null {
    if (!config?.definition) return config;
    
    (config as Config & { name: string }).name = config.definition.name;
    (config as Config & { company?: string }).company = config.definition.company;
    return config;
  }

  private withVirtualPropertiesList(configs: Config[]): Config[] {
    return configs.map(c => this.withVirtualProperties(c) as Config);
  }

  private async userHasVersioning(userId: string): Promise<boolean> {
    const sub = await this.subscriptionService.getOrCreateDefaultSubscription(userId);
    return this.subscriptionService.hasFeature(sub.tier, sub.status, Feature.CONFIG_VERSIONING);
  }


  private async resolveDefinitionForConfig(config: Config, brand: Brand, company: string): Promise<ConfigDefinition> {
    if (config.definition) {
      await this.configDefinitionService.syncDefinitionAssociations(config.definition, brand, company);
      return config.definition;
    }

    throw new NotFoundException(`Config definition missing for config "${config.id}"`);
  }

  async create(userId: string, brandId: number, dto: CreateConfigDto, company: string): Promise<Config> {
    const brand = await this.getBrandByIdForUser(userId, brandId);
    const definition = await this.configDefinitionService.getOrCreateDefinition(brand, dto.name, company);

    const latestConfig = await this.configRepo.findOne({
      where: {
        brand: { id: brand.id },
        definition: { id: definition.id },
      },
      order: { version: 'DESC' },
    });

    const nextVersion = latestConfig ? latestConfig.version + 1 : 1;

    const config = this.configRepo.create({
      description: dto.description,
      formData: dto.formData ?? {},
      layout: dto.layout ?? undefined,
      brand: { id: brand.id } as Brand,
      definition: { id: definition.id } as ConfigDefinition,
      version: nextVersion,
    });

    const savedConfig = await this.configRepo.save(config);

    if (nextVersion === 1) {
      await this.setActiveVersionForConfig(brand.id, definition.name, savedConfig.version, company);
    }

    // Reload with definition relation to ensure it's properly loaded
    const reloadedConfig = await this.configRepo.findOne({
      where: { id: savedConfig.id },
      relations: ['definition'],
    });

    return this.withVirtualProperties(reloadedConfig) as Config;
  }

  /**
   * Updates config content (description, formData, layout)
   * Always creates a new version. Use updateDefinitionName for renaming.
   */
  async update(
    userId: string,
    brandId: number,
    configId: number,
    dto: UpdateConfigDto,
    company: string,
  ): Promise<UpdateConfigResponseDto> {
    const brand = await this.getBrandByIdForUser(userId, brandId);

    const existing = await this.configRepo
      .createQueryBuilder('config')
      .leftJoinAndSelect('config.definition', 'definition')
      .where('config.id = :configId', { configId })
      .andWhere('config.brandId = :brandId', { brandId: brand.id })
      .andWhere('definition.company = :company', { company })
      .getOne();

    if (!existing) {
      throw new NotFoundException(`Config with ID "${configId}" not found`);
    }

    const definition = await this.resolveDefinitionForConfig(existing, brand, company);

    // Get next version number
    const latestConfig = await this.configRepo.findOne({
      where: {
        brand: { id: brand.id },
        definition: { id: definition.id },
      },
      order: { version: 'DESC' },
    });

    const nextVersion = latestConfig ? latestConfig.version + 1 : 1;

    // Create new config version with updated content
    const newConfig = this.configRepo.create({
      description: dto.description ?? existing.description,
      formData: dto.formData ?? existing.formData,
      layout: dto.layout ?? existing.layout,
      brand: { id: brand.id } as Brand,
      definition: { id: definition.id } as ConfigDefinition,
      version: nextVersion,
    });

    const savedConfig = await this.configRepo.save(newConfig);
    await this.setActiveVersionForConfig(brand.id, definition.name, savedConfig.version, company);
    
    const reloadedConfig = await this.configRepo.findOne({
      where: { id: savedConfig.id },
      relations: ['definition'],
    });
    
    const allVersions = await this.getConfigVersions(userId, brandId, definition.name, company);
    
    return {
      config: this.withVirtualProperties(reloadedConfig) as Config,
      versions: allVersions
    };
  }

  // ==================== Config CRUD Methods ====================

  async findOneByBrandAndCompanyId(userId: string, brandId: number, configId: number, company: string): Promise<Config> {
    const brand = await this.getBrandByIdForUser(userId, brandId);

    const config = await this.configRepo
      .createQueryBuilder('config')
      .leftJoinAndSelect('config.definition', 'definition')
      .where('config.id = :configId', { configId })
      .andWhere('config.brandId = :brandId', { brandId: brand.id })
      .andWhere('definition.company = :company', { company })
      .getOne();

    if (!config) {
      throw new NotFoundException(`Config with ID "${configId}" not found`);
    }

    return this.withVirtualProperties(config) as Config;
  }

  async remove(userId: string, brandId: number, configId: number): Promise<void> {
    const brand = await this.getBrandByIdForUser(userId, brandId);

    const config = await this.configRepo.findOne({
      where: { id: configId, brand: { id: brand.id } },
    });

    if (!config) {
      throw new NotFoundException(`Config with ID "${configId}" not found`);
    }

    await this.configRepo.remove(config);
  }

  async findAllConfigsForBrand(userId: string, brandId: number, company: string): Promise<Config[]> {
    const brand = await this.getBrandByIdForUser(userId, brandId);
    const hasVersioning = await this.userHasVersioning(userId);
    
    if (!hasVersioning) {
      const allConfigs = await this.configRepo
        .createQueryBuilder('config')
        .leftJoinAndSelect('config.definition', 'definition')
        .where('config.brandId = :brandId', { brandId: brand.id })
        .andWhere('definition.company = :company', { company })
        .getMany();
      const hydrated = this.withVirtualPropertiesList(allConfigs);
      const latestByName = new Map<string, Config>();
      for (const cfg of hydrated) {
        const existing = latestByName.get(cfg.name);
        if (!existing || cfg.version > existing.version) {
          latestByName.set(cfg.name, cfg);
        }
      }
      return Array.from(latestByName.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    const activeVersions = await this.activeVersionRepo.find({
      where: {
        brand: { id: brand.id },
        company,
      },
    });

    const activeConfigs: Config[] = [];
    const activeDefinitionIds = new Set<number>();
    const activeVersionsToUpdate: ActiveVersion[] = [];

    for (const activeVersion of activeVersions) {
      const definition =
        activeVersion.configDefinition ??
        (await this.configDefinitionService.getOrCreateDefinition(brand, activeVersion.configName, company));

      if (
        !activeVersion.configDefinition ||
        activeVersion.configDefinition.id !== definition.id ||
        activeVersion.configName !== definition.name
      ) {
        activeVersion.configDefinition = definition;
        activeVersion.configName = definition.name;
        activeVersionsToUpdate.push(activeVersion);
      }

      activeDefinitionIds.add(definition.id);

      const config = await this.configRepo.findOne({
        where: {
          brand: { id: brand.id },
          definition: { id: definition.id },
          version: activeVersion.activeVersion,
        },
        relations: ['definition'],
      });

      const hydrated = this.withVirtualProperties(config);
      if (hydrated) {
        activeConfigs.push(hydrated as Config);
      }
    }

    if (activeVersionsToUpdate.length > 0) {
      await this.activeVersionRepo.save(activeVersionsToUpdate);
    }

    const allConfigs = await this.configRepo
      .createQueryBuilder('config')
      .leftJoinAndSelect('config.definition', 'definition')
      .where('config.brandId = :brandId', { brandId: brand.id })
      .andWhere('definition.company = :company', { company })
      .getMany();

    const hydratedConfigs = this.withVirtualPropertiesList(allConfigs);
    const configsByDefinition = new Map<number, Config[]>();

    for (const config of hydratedConfigs) {
      const definitionId = config.definition?.id;
      if (!definitionId) {
        continue;
      }
      const list = configsByDefinition.get(definitionId) ?? [];
      list.push(config);
      configsByDefinition.set(definitionId, list);
    }

    for (const [definitionId, configs] of configsByDefinition.entries()) {
      if (activeDefinitionIds.has(definitionId)) {
        continue;
      }
      configs.sort((a, b) => b.version - a.version);
      const latest = configs[0];
      if (latest) {
        activeConfigs.push(latest);
      }
    }

    return activeConfigs
      .map(config => this.withVirtualProperties(config) as Config)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findConfigByNameAndValue(userId: string, brandName: string, name: string, valueKey: string, company: string): Promise<{value: any}> {
    const brand = await this.brandRepo.findOne({
      where: { user: { auth0Id: userId }, name: brandName, company: company },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with name "${brandName}" not found for this user`);
    }

    const config = await this.getActiveConfig(userId, brand.id, name, company);

    const value = config?.formData[valueKey];

    return { value };
  }

  async findConfigByNameAndValueForSDK(brandName: string, name: string, valueKey: string, company: string): Promise<{value: any}> {
    const config = await this.getActiveConfigForSDK(brandName, name, company);

    if (!config) {
      throw new NotFoundException(`Config with name "${name}" not found for brand "${brandName}"`);
    }

    const value = config?.formData[valueKey];

    return { value };
  }

  async getConfigVersions(userId: string, brandId: number, configName: string, company: string): Promise<Config[]> {
    const brand = await this.getBrandByIdForUser(userId, brandId);
    const hasVersioning = await this.userHasVersioning(userId);

    if (!hasVersioning) {
      const definition = await this.configDefinitionRepo.findOne({
        where: {
          brand: { id: brand.id },
          name: configName,
          company,
        },
      });

      if (!definition) {
        return [];
      }

      const latest = await this.configRepo.findOne({
        where: { brand: { id: brand.id }, definition: { id: definition.id } },
        order: { version: 'DESC' },
        relations: ['definition'],
      });
      return latest ? [this.withVirtualProperties(latest) as Config] : [];
    }

    let definition = await this.configDefinitionRepo.findOne({
      where: {
        brand: { id: brand.id },
        name: configName,
        company,
      },
    });

    if (!definition) {
      return [];
    }

    await this.configDefinitionService.syncDefinitionAssociations(definition, brand, company);

    const configs = await this.configRepo.find({
      where: {
        brand: { id: brand.id },
        definition: { id: definition.id },
      },
      order: { version: 'DESC' },
    });

    return this.withVirtualPropertiesList(configs);
  }


  async getConfigVersionsById(userId: string, brandId: number, configDefinitionId: number, company: string): Promise<{ activeVersion: Config | null; versions: Config[] }> {    
    // Get the definition by ID
    const definition = await this.configDefinitionRepo.findOne({
      where: {
        id: configDefinitionId,
        brand: { id: brandId, user: { auth0Id: userId } },
        company,
      },
    });
    
    if (!definition) {
      throw new NotFoundException(`Config definition with ID "${configDefinitionId}" not found`);
    }
    
    // Get all versions
    const versions = await this.getConfigVersions(userId, brandId, definition.name, company);
    
    // Get the active version
    const activeVersion = await this.getActiveConfig(userId, brandId, definition.name, company);
    
    return {
      activeVersion,
      versions
    };
  }

  async getActiveConfig(userId: string, brandId: number, configName: string, company: string): Promise<Config | null> {
    const brand = await this.getBrandByIdForUser(userId, brandId);
    const hasVersioning = await this.userHasVersioning(userId);
    
    if (!hasVersioning) {
      const definition = await this.configDefinitionRepo.findOne({
        where: {
          brand: { id: brand.id },
          name: configName,
          company,
        },
      });

      if (!definition) {
        return null;
      }

      const latest = await this.configRepo.findOne({
        where: { brand: { id: brand.id }, definition: { id: definition.id } },
        order: { version: 'DESC' },
        relations: ['definition'],
      });

      return this.withVirtualProperties(latest) as Config | null;
    }

    let definition = await this.configDefinitionRepo.findOne({
      where: {
        brand: { id: brand.id },
        name: configName,
        company,
      },
    });

    if (!definition) {
      return null;
    }

    await this.configDefinitionService.syncDefinitionAssociations(definition, brand, company);

    const activeVersion = await this.activeVersionRepo.findOne({
      where: { brand: { id: brand.id }, configDefinition: { id: definition.id }, company },
    });

    if (!activeVersion) {
      const latest = await this.configRepo.findOne({
        where: { brand: { id: brand.id }, definition: { id: definition.id } },
        order: { version: 'DESC' },
      });
      return this.withVirtualProperties(latest) as Config | null;
    }

    const config = await this.configRepo.findOne({
      where: {
        brand: { id: brand.id },
        definition: { id: definition.id },
        version: activeVersion.activeVersion,
      },
      relations: ['definition'],
    });

    return this.withVirtualProperties(config) as Config | null;
  }

  async setActiveVersionForConfig(brandId: number, configName: string, version: number, company: string): Promise<void> {
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });

    if (!brand) {
      throw new NotFoundException(`Brand with ID "${brandId}" not found`);
    }

    const definition = await this.configDefinitionRepo.findOne({
      where: {
        brand: { id: brand.id },
        name: configName,
        company,
      },
    });

    if (!definition) {
      throw new NotFoundException(`Config "${configName}" not found for this brand`);
    }

    await this.configDefinitionService.syncDefinitionAssociations(definition, brand, company);

    const config = await this.configRepo.findOne({
      where: {
        brand: { id: brandId },
        definition: { id: definition.id },
        version,
      },
    });

    if (!config) {
      const allConfigs = await this.configRepo.find({
        where: {
          brand: { id: brandId },
          definition: { id: definition.id },
        },
        order: { version: 'DESC' },
      });

      const existingVersions = allConfigs.map(c => c.version).join(', ');
      throw new NotFoundException(
        `Config "${definition.name}" version "${version}" not found for this brand. ` +
        `Available versions: ${existingVersions || 'none'}`,
      );
    }

    const existingActiveVersion = await this.activeVersionRepo.findOne({
      where: {
        brand: { id: brandId },
        configDefinition: { id: definition.id },
        company,
      },
    });

    if (existingActiveVersion) {
      existingActiveVersion.activeVersion = version;
      existingActiveVersion.configName = definition.name;
      existingActiveVersion.configDefinition = definition;
      await this.activeVersionRepo.save(existingActiveVersion);
    } else {
      const activeVersion = this.activeVersionRepo.create({
        brand,
        configName: definition.name,
        configDefinition: definition,
        company,
        activeVersion: version,
      });
      await this.activeVersionRepo.save(activeVersion);
    }
  }

  async setActiveVersionByName(userId: string, brandId: number, configName: string, version: number, company: string): Promise<void> {
    const brand = await this.getBrandByIdForUser(userId, brandId);
    await this.setActiveVersionForConfig(brand.id, configName, version, company);
  }

  async getActiveConfigForSDK(brandName: string, configName: string, company: string): Promise<Config | null> {
    const brand = await this.brandRepo.findOne({
      where: { name: brandName, company: company },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with name "${brandName}" not found`);
    }
    
    const definition = await this.configDefinitionRepo.findOne({
      where: {
        brand: { id: brand.id },
        name: configName,
        company,
      },
    });

    if (!definition) {
      return null;
    }

    await this.configDefinitionService.syncDefinitionAssociations(definition, brand, company);

    const activeVersion = await this.activeVersionRepo.findOne({
      where: {
        brand: { id: brand.id },
        configDefinition: { id: definition.id },
        company,
      },
    });
    
    if (!activeVersion) {
      const latest = await this.configRepo.findOne({
        where: { brand: { id: brand.id }, definition: { id: definition.id } },
        order: { version: 'DESC' },
      });
      return this.withVirtualProperties(latest) as Config | null;
    }
    
    const config = await this.configRepo.findOne({
      where: { 
        brand: { id: brand.id }, 
        definition: { id: definition.id }, 
        version: activeVersion.activeVersion,
      },
    });

    return this.withVirtualProperties(config) as Config | null;
  }

  async updateConfigLayout(
    userId: string,
    brandId: number,
    configId: number,
    dto: UpdateConfigLayoutDto,
    company: string,
  ): Promise<UpdateConfigResponseDto> {
    const brand = await this.getBrandByIdForUser(userId, brandId);

    const existing = await this.configRepo
      .createQueryBuilder('config')
      .leftJoinAndSelect('config.definition', 'definition')
      .where('config.id = :configId', { configId })
      .andWhere('config.brandId = :brandId', { brandId: brand.id })
      .andWhere('definition.company = :company', { company })
      .getOne();

    if (!existing) {
      throw new NotFoundException(`Config with ID "${configId}" not found`);
    }

    const definition = await this.resolveDefinitionForConfig(existing, brand, company);

    // Get next version number
    const latestConfig = await this.configRepo.findOne({
      where: {
        brand: { id: brand.id },
        definition: { id: definition.id },
      },
      order: { version: 'DESC' },
    });

    const nextVersion = latestConfig ? latestConfig.version + 1 : 1;

    // Create new config version with updated layout and formData
    const newConfig = this.configRepo.create({
      description: existing.description,
      formData: dto.formData,
      layout: dto.layout,
      brand: { id: brand.id } as Brand,
      definition: { id: definition.id } as ConfigDefinition,
      version: nextVersion,
    });

    const savedConfig = await this.configRepo.save(newConfig);
    await this.setActiveVersionForConfig(brand.id, definition.name, savedConfig.version, company);
    
    const reloadedConfig = await this.configRepo.findOne({
      where: { id: savedConfig.id },
      relations: ['definition'],
    });
    
    const allVersions = await this.getConfigVersions(userId, brandId, definition.name, company);
    
    return {
      config: this.withVirtualProperties(reloadedConfig) as Config,
      versions: allVersions
    };
  }

  private async getBrandByIdForUser(userId: string, brandId: number): Promise<Brand> {
    
    const brand = await this.brandRepo.findOne({
      where: { user: { auth0Id: userId }, id: brandId },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID "${brandId}" not found for this user`);
    }

    return brand;
  }

}