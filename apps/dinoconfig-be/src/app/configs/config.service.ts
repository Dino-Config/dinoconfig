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
import { UpdateFieldDto, FieldType } from './dto/update-field.dto';
import { JSONSchema7 } from 'json-schema';

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

  private getSchemaType(fieldType: FieldType): JSONSchema7['type'] {
    if (['number', 'range'].includes(fieldType)) {
      return 'number';
    }
    if (fieldType === 'checkbox') {
      return 'boolean';
    }
    return 'string';
  }

  private getWidget(fieldType: FieldType): string | undefined {
    const widgetMap: Record<FieldType, string | undefined> = {
      text: undefined,
      password: 'password',
      select: undefined,
      checkbox: undefined,
      radio: 'radio',
      number: undefined,
      textarea: 'textarea',
      email: 'email',
      range: 'range',
      url: 'uri',
      tel: undefined,
      search: undefined,
      time: undefined,
      'datetime-local': undefined,
      month: undefined,
      week: undefined,
    };

    return widgetMap[fieldType];
  }

  private requiresInputType(fieldType: FieldType): boolean {
    const unsupported: FieldType[] = ['tel', 'search', 'time', 'datetime-local', 'month', 'week'];
    return unsupported.includes(fieldType);
  }

  private createUiEntry(fieldType: FieldType, widget?: string) {
    if (this.requiresInputType(fieldType)) {
      return {
        'ui:widget': 'text',
        'ui:options': { inputType: fieldType },
      };
    }

    if (widget) {
      return {
        'ui:widget': widget,
      };
    }

    return {};
  }

  private getDefaultValueForField(fieldType: FieldType, options?: string) {
    if (fieldType === 'checkbox') {
      return false;
    }
    if (['number', 'range'].includes(fieldType)) {
      return 0;
    }
    if (['radio', 'select'].includes(fieldType) && options) {
      const parsed = options
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);
      return parsed[0] ?? '';
    }
    return '';
  }

  private shouldResetValue(fieldType: FieldType, previousValue: unknown, options?: string): boolean {
    if (previousValue === undefined) {
      return true;
    }

    switch (fieldType) {
      case 'checkbox':
        return typeof previousValue !== 'boolean';
      case 'number':
      case 'range':
        return typeof previousValue !== 'number';
      case 'radio':
      case 'select': {
        if (typeof previousValue !== 'string') {
          return true;
        }
        if (!options) {
          return false;
        }
        const parsed = options
          .split(',')
          .map(o => o.trim())
          .filter(Boolean);
        return !parsed.includes(previousValue as string);
      }
      default:
        return typeof previousValue !== 'string';
    }
  }

  private buildSchemaProperty(dto: UpdateFieldDto, fieldType: FieldType) {
    const schemaProperty: Record<string, any> = {
      type: this.getSchemaType(fieldType),
      title: dto.label || dto.name,
    };

    if (['select', 'radio'].includes(fieldType) && dto.options) {
      schemaProperty.enum = dto.options
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);
    }

    if (typeof dto.min === 'number') {
      schemaProperty.minimum = dto.min;
    }
    if (typeof dto.max === 'number') {
      schemaProperty.maximum = dto.max;
    }
    if (typeof dto.maxLength === 'number') {
      schemaProperty.maxLength = dto.maxLength;
    }
    if (dto.pattern) {
      schemaProperty.pattern = dto.pattern;
    }

    return schemaProperty;
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

  async updateField(
    userId: string,
    brandId: number,
    configId: number,
    fieldName: string,
    dto: UpdateFieldDto,
    company: string,
  ): Promise<UpdateConfigResponseDto> {
    const brand = await this.getBrandByIdForUser(userId, brandId);

    const existing = await this.configRepo.findOne({
      where: { id: configId, brand: { id: brand.id }, company },
    });

    if (!existing) {
      throw new NotFoundException(`Config with ID "${configId}" not found`);
    }

    const schema: JSONSchema7 = {
      type: 'object',
      properties: {},
      ...((existing.schema as JSONSchema7) ?? {}),
    };

    const properties: Record<string, any> = { ...(schema.properties as Record<string, any> ?? {}) };

    if (!properties[fieldName]) {
      throw new NotFoundException(`Field "${fieldName}" not found in config "${existing.name}"`);
    }

    const newFieldName = dto.name.trim();
    const updatedProperties = { ...properties };

    delete updatedProperties[fieldName];
    updatedProperties[newFieldName] = this.buildSchemaProperty(dto, dto.type);

    const requiredSet = new Set<string>(Array.isArray(schema.required) ? schema.required as string[] : []);
    if (fieldName !== newFieldName) {
      requiredSet.delete(fieldName);
    }
    if (dto.required) {
      requiredSet.add(newFieldName);
    } else {
      requiredSet.delete(newFieldName);
    }

    const updatedSchema: JSONSchema7 = {
      ...schema,
      properties: updatedProperties,
    };

    if (requiredSet.size > 0) {
      updatedSchema.required = Array.from(requiredSet);
    } else {
      delete updatedSchema.required;
    }

    const existingUiSchema = existing.uiSchema ?? {};
    const updatedUiSchema: Record<string, any> = { ...existingUiSchema };
    if (fieldName !== newFieldName) {
      delete updatedUiSchema[fieldName];
    }

    const uiEntry = this.createUiEntry(dto.type, this.getWidget(dto.type));
    if (Object.keys(uiEntry).length > 0) {
      updatedUiSchema[newFieldName] = uiEntry;
    } else {
      delete updatedUiSchema[newFieldName];
    }

    const updatedFormData: Record<string, any> = { ...(existing.formData ?? {}) };
    const previousValue = updatedFormData[fieldName];
    if (fieldName !== newFieldName) {
      delete updatedFormData[fieldName];
    }

    if (this.shouldResetValue(dto.type, previousValue, dto.options)) {
      updatedFormData[newFieldName] = this.getDefaultValueForField(dto.type, dto.options);
    } else if (previousValue !== undefined) {
      updatedFormData[newFieldName] = previousValue;
    } else {
      updatedFormData[newFieldName] = this.getDefaultValueForField(dto.type, dto.options);
    }

    return this.update(
      userId,
      brandId,
      configId,
      {
        schema: updatedSchema as Record<string, any>,
        uiSchema: updatedUiSchema,
        formData: updatedFormData,
      },
      company,
    );
  }

  async removeField(
    userId: string,
    brandId: number,
    configId: number,
    fieldName: string,
    company: string,
  ): Promise<UpdateConfigResponseDto> {
    const brand = await this.getBrandByIdForUser(userId, brandId);

    const existing = await this.configRepo.findOne({
      where: { id: configId, brand: { id: brand.id }, company },
    });

    if (!existing) {
      throw new NotFoundException(`Config with ID "${configId}" not found`);
    }

    const schema: JSONSchema7 = {
      type: 'object',
      properties: {},
      ...((existing.schema as JSONSchema7) ?? {}),
    };

    const properties: Record<string, any> = { ...(schema.properties as Record<string, any> ?? {}) };

    if (!properties[fieldName]) {
      throw new NotFoundException(`Field "${fieldName}" not found in config "${existing.name}"`);
    }

    delete properties[fieldName];

    const updatedSchema: JSONSchema7 = {
      ...schema,
      properties,
    };

    if (Array.isArray(schema.required)) {
      const remainingRequired = (schema.required as string[]).filter(name => name !== fieldName);
      if (remainingRequired.length > 0) {
        updatedSchema.required = remainingRequired;
      } else {
        delete updatedSchema.required;
      }
    }

    const existingUiSchema = existing.uiSchema ?? {};
    const updatedUiSchema: Record<string, any> = { ...existingUiSchema };
    delete updatedUiSchema[fieldName];

    const updatedFormData: Record<string, any> = { ...(existing.formData ?? {}) };
    delete updatedFormData[fieldName];

    return this.update(
      userId,
      brandId,
      configId,
      {
        schema: updatedSchema as Record<string, any>,
        uiSchema: updatedUiSchema,
        formData: updatedFormData,
      },
      company,
    );
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