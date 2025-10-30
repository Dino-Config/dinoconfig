import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './entities/config.entity';
import { ActiveVersion } from './entities/active-version.entity';
import { Brand } from '../brands/entities/brand.entity';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { UpdateConfigResponseDto } from './dto/update-config-response.dto';
import { SubscriptionService } from '../subscriptions/subscription.service';
import { Feature } from '../features/enums/feature.enum';

@Injectable()
export class ConfigsService {
  constructor(
    @InjectRepository(Config) private readonly configRepo: Repository<Config>,
    @InjectRepository(ActiveVersion) private readonly activeVersionRepo: Repository<ActiveVersion>,
    @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  private async userHasVersioning(userId: string): Promise<boolean> {
    const sub = await this.subscriptionService.getOrCreateDefaultSubscription(userId);
    return this.subscriptionService.hasFeature(sub.tier, sub.status, Feature.CONFIG_VERSIONING);
  }

  async create(userId: string, brandId: number, dto: CreateConfigDto, company: string): Promise<Config> {
    const brand = await this.getBrandByIdForUser(userId, brandId);
  
    // Get the latest version for this specific config name
    const latestConfig = await this.configRepo.findOne({
      where: { 
        brand: { id: brand.id }, 
        name: dto.name,
        company: company 
      },
      order: { version: 'DESC' }
    });
    
    const nextVersion = latestConfig ? latestConfig.version + 1 : 1;
  
    const config = this.configRepo.create({
      ...dto,
      formData: dto.formData ?? {},
      schema: dto.schema ?? { type: 'object', properties: {} },
      uiSchema: dto.uiSchema ?? {},
      brand: { id: brand.id } as Brand, // Use brand ID directly to avoid lazy loading issues
      version: nextVersion,
      company: company,
    });
  
    const savedConfig = await this.configRepo.save(config);
    
    // Set this as the active version for this config name if it's the first version
    if (nextVersion === 1) {
      await this.setActiveVersionForConfig(brand.id, dto.name, savedConfig.version, company);
    }
    
    return savedConfig;
  }

  async update(
    userId: string,
    brandId: number,
    configId: number,
    dto: UpdateConfigDto,
    company: string,
  ): Promise<UpdateConfigResponseDto> {
    const brand = await this.getBrandByIdForUser(userId, brandId);

    const existing = await this.configRepo.findOne({
      where: { id: configId, brand: { id: brand.id }, company: company },
    });

    if (!existing) {
      throw new NotFoundException(`Config with ID "${configId}" not found`);
    }

    // Get the latest version for this specific config name
    const latestConfig = await this.configRepo.findOne({
      where: { 
        brand: { id: brand.id }, 
        name: existing.name,
        company: company 
      },
      order: { version: 'DESC' }
    });
    
    const nextVersion = latestConfig ? latestConfig.version + 1 : 1;

    // Create a completely new record with incremented version
    const newConfig = this.configRepo.create({
      name: dto.name ?? existing.name,
      description: dto.description ?? existing.description,
      formData: dto.formData ?? existing.formData,
      schema: dto.schema ?? existing.schema,
      uiSchema: dto.uiSchema ?? existing.uiSchema,
      brand: { id: brand.id } as Brand, // Use brand ID directly to avoid lazy loading issues
      version: nextVersion,
      company: existing.company,
    });

    const savedConfig = await this.configRepo.save(newConfig);
    // Update the active version for this config name
    await this.setActiveVersionForConfig(brand.id, savedConfig.name, savedConfig.version, company);
    
    // Get all versions for this config name to return in response
    const allVersions = await this.getConfigVersions(userId, brandId, savedConfig.name, company);
    
    return {
      config: savedConfig,
      versions: allVersions
    };
  }

  async findOneByBrandAndCompanyId(userId: string, brandId: number, configId: number, company: string): Promise<Config> {
    const brand = await this.getBrandByIdForUser(userId, brandId);

    const config = await this.configRepo.findOne({
      where: { id: configId, brand: { id: brand.id }, company: company },
    });

    if (!config) {
      throw new NotFoundException(`Config with ID "${configId}" not found`);
    }

    return config;
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
      const allConfigs = await this.configRepo.find({
        where: { 
          brand: { id: brand.id }, 
          company: company 
        },
      });
      const latestByName = new Map<string, Config>();
      for (const cfg of allConfigs) {
        const existing = latestByName.get(cfg.name);
        if (!existing || cfg.version > existing.version) {
          latestByName.set(cfg.name, cfg);
        }
      }
      return Array.from(latestByName.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    // Get all active versions for this brand from active_versions table
    const activeVersions = await this.activeVersionRepo.find({
      where: { 
        brand: { id: brand.id }, 
        company: company 
      },
    });
    
    // Get all configs that match active versions using Promise.all for parallel queries
    const activeConfigPromises = activeVersions.map(av => 
      this.configRepo.findOne({
        where: { 
          brand: { id: brand.id }, 
          name: av.configName,
          version: av.activeVersion,
          company: company 
        },
      })
    );
    
    let activeConfigs = (await Promise.all(activeConfigPromises)).filter(c => c !== null) as Config[];
    
    // Get names of configs that have active versions
    const configsWithActiveVersions = activeVersions.map(av => av.configName);
    
    // Get all unique config names for this brand
    const allConfigs = await this.configRepo.find({
      where: { 
        brand: { id: brand.id }, 
        company: company 
      },
    });
    
    // Get unique config names
    const uniqueConfigNames = [...new Set(allConfigs.map(c => c.name))];
    
    // For configs without active versions, get the latest version
    for (const configName of uniqueConfigNames) {
      if (!configsWithActiveVersions.includes(configName)) {
        const config = allConfigs
          .filter(c => c.name === configName)
          .sort((a, b) => b.version - a.version)[0];
        
        if (config) {
          activeConfigs.push(config);
        }
      }
    }
    
    // Sort by creation date
    return activeConfigs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  async getConfigVersions(userId: string, brandId: number, configName: string, company: string): Promise<Config[]> {
    const brand = await this.getBrandByIdForUser(userId, brandId);
    const hasVersioning = await this.userHasVersioning(userId);

    if (!hasVersioning) {
      // Return only the latest version
      const latest = await this.configRepo.findOne({
        where: { name: configName, brand: { id: brand.id }, company: company },
        order: { version: 'DESC' },
      });
      return latest ? [latest] : [];
    }

    return this.configRepo.find({
      where: { name: configName, brand: { id: brand.id }, company: company },
      order: { version: 'DESC' },
    });
  }


  async getConfigVersionsById(userId: string, brandId: number, configId: number, company: string): Promise<Config[]> {
    const brand = await this.getBrandByIdForUser(userId, brandId);
    
    // First get the config to find its name
    const config = await this.configRepo.findOne({
      where: { id: configId, brand: { id: brand.id }, company: company },
    });
    
    if (!config) {
      throw new NotFoundException(`Config with ID "${configId}" not found`);
    }
    
    return this.getConfigVersions(userId, brandId, config.name, company);
  }

  async getActiveConfig(userId: string, brandId: number, configName: string, company: string): Promise<Config | null> {
    const brand = await this.getBrandByIdForUser(userId, brandId);
    const hasVersioning = await this.userHasVersioning(userId);
    
    if (!hasVersioning) {
      // No versioning: always return latest from configs table
      return this.configRepo.findOne({
        where: { brand: { id: brand.id }, name: configName, company: company },
        order: { version: 'DESC' },
      });
    }

    // Get the active version for this config name
    const activeVersion = await this.activeVersionRepo.findOne({
      where: { brand: { id: brand.id }, configName: configName, company: company },
    });
    
    if (!activeVersion) {
      // Fallback to latest if active not set
      return this.configRepo.findOne({
        where: { brand: { id: brand.id }, name: configName, company: company },
        order: { version: 'DESC' },
      });
    }
    
    return this.configRepo.findOne({
      where: { brand: { id: brand.id }, name: configName, version: activeVersion.activeVersion, company: company },
    });
  }

  async setActiveVersionForConfig(brandId: number, configName: string, version: number, company: string): Promise<void> {
    // Verify that a config with this version exists
    const config = await this.configRepo.findOne({
      where: { 
        brand: { id: brandId }, 
        name: configName,
        version: version, 
        company: company 
      },
    });
    
    if (!config) {
      // Debug: Let's see what configs actually exist for this name
      const allConfigsForName = await this.configRepo.find({
        where: { 
          brand: { id: brandId }, 
          name: configName,
          company: company 
        },
        order: { version: 'DESC' }
      });
      
      const existingVersions = allConfigsForName.map(c => c.version).join(', ');
      throw new NotFoundException(
        `Config "${configName}" version "${version}" not found for this brand. ` +
        `Available versions: ${existingVersions || 'none'}`
      );
    }
    
    // Check if active version record already exists
    const existingActiveVersion = await this.activeVersionRepo.findOne({
      where: { 
        brand: { id: brandId }, 
        configName: configName,
        company: company 
      },
    });
    
    if (existingActiveVersion) {
      // Update existing record
      existingActiveVersion.activeVersion = version;
      await this.activeVersionRepo.save(existingActiveVersion);
    } else {
      // Create new record
      const brand = await this.brandRepo.findOne({ where: { id: brandId } });
      const activeVersion = this.activeVersionRepo.create({
        brand,
        configName,
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
    
    // Get the active version for this config name
    const activeVersion = await this.activeVersionRepo.findOne({
      where: { 
        brand: { id: brand.id }, 
        configName: configName,
        company: company 
      },
    });
    
    if (!activeVersion) {
      // If no active version is set, return the latest version
      return this.configRepo.findOne({
        where: { brand: { id: brand.id }, name: configName, company: company },
        order: { version: 'DESC' },
      });
    }
    
    return this.configRepo.findOne({
      where: { 
        brand: { id: brand.id }, 
        name: configName, 
        version: activeVersion.activeVersion,
        company: company 
      },
    });
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