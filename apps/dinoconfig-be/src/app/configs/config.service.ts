import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './entities/config.entity';
import { Brand } from '../brands/entities/brand.entity';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';

@Injectable()
export class ConfigsService {
  constructor(
    @InjectRepository(Config) private readonly configRepo: Repository<Config>,
    @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
  ) {}

  async create(userId: string, brandId: number, dto: CreateConfigDto, company: string): Promise<Config> {
    const brand = await this.getBrandByIdForUser(userId, brandId);
  
    const config = this.configRepo.create({
      ...dto,
      formData: dto.formData ?? {},
      schema: dto.schema ?? { type: 'object', properties: {} },
      uiSchema: dto.uiSchema ?? {},
      brand,
      version: 1,
      company: company,
    });
  
    return this.configRepo.save(config);
  }

  async update(
    userId: string,
    brandId: number,
    configId: number,
    dto: UpdateConfigDto,
  ): Promise<Config> {
    const brand = await this.getBrandByIdForUser(userId, brandId);

    const existing = await this.configRepo.findOne({
      where: { id: configId, brand: { id: brand.id } },
    });

    if (!existing) {
      throw new NotFoundException(`Config with ID "${configId}" not found`);
    }

    const updated = this.configRepo.create({
      ...existing,
      ...dto,
      formData: dto.formData ?? existing.formData,
      schema: dto.schema ?? existing.schema,
      uiSchema: dto.uiSchema ?? existing.uiSchema,
      brand: existing.brand,
      version: existing.version + 1,
      createdAt: undefined, // let DB generate timestamp
    });

    return this.configRepo.save(updated);
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
    
    return this.configRepo.find({
      where: { brand: { id: brand.id }, company: company },
      order: { createdAt: 'DESC' },
    });
  }

  async findConfigByNameAndValue(userId: string, brandName: string, name: string, valueKey: string, company: string): Promise<{value: any}> {
    const brand = await this.brandRepo.findOne({
      where: { user: { auth0Id: userId }, name: brandName, company: company },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with name "${brandName}" not found for this user`);
    }

    const config = await this.configRepo.findOne({
      where: { brand: { id: brand.id }, name: name, company: company },
    });

    const value = config?.formData[valueKey];

    return { value };
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