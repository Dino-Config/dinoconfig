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

  async create(userId: number, brandId: number, dto: CreateConfigDto, company: string): Promise<Config> {
    const brand = await this.getBrandByIdForUser(userId, brandId);
  
    const config = this.configRepo.create({
      ...dto,
      data: dto.data ?? {},
      brand,
      version: 1,
      company: company,
    });
  
    return this.configRepo.save(config);
  }

  async update(
    userId: number,
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
      brand: existing.brand,
      version: existing.version + 1,
      createdAt: undefined, // let DB generate timestamp
    });

    return this.configRepo.save(updated);
  }

  async findOneByBrandAndCompanyId(userId: number, brandId: number, configId: number, company: string): Promise<Config> {
    const brand = await this.getBrandByIdForUser(userId, brandId);

    const config = await this.configRepo.findOne({
      where: { id: configId, brand: { id: brand.id }, company: company },
    });

    if (!config) {
      throw new NotFoundException(`Config with ID "${configId}" not found`);
    }

    console.log(config);

    return config;
  }

  async remove(userId: number, brandId: number, configId: number): Promise<void> {
    const brand = await this.getBrandByIdForUser(userId, brandId);

    const config = await this.configRepo.findOne({
      where: { id: configId, brand: { id: brand.id } },
    });

    if (!config) {
      throw new NotFoundException(`Config with ID "${configId}" not found`);
    }

    await this.configRepo.remove(config);
  }

  async findAllConfigsForBrand(userId: number, brandId: number, company: string): Promise<Config[]> {
    const brand = await this.getBrandByIdForUser(userId, brandId);
    
    return this.configRepo.find({
      where: { brand: { id: brand.id }, company: company },
      order: { createdAt: 'DESC' },
    });
  }

  private async getBrandByIdForUser(userId: number, brandId: number): Promise<Brand> {
    
    const brand = await this.brandRepo.findOne({
      where: { user: { id: userId }, id: brandId },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID "${brandId}" not found for this user`);
    }

    return brand;
  }

}