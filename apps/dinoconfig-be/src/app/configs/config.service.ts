// configs.service.ts
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
    @InjectRepository(Config) private configRepo: Repository<Config>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>
  ) {}

  async create(brandId: number, dto: CreateConfigDto): Promise<Config> {
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('Brand not found');
    

    // First version is always 1
    const config = this.configRepo.create({
      ...dto,
      brand,
      configKey: dto.name.toLowerCase().replace(/\s+/g, '_'),
      version: 1,
    });

    return this.configRepo.save(config);
  }

  async update(brandId: number, configKey: string, dto: UpdateConfigDto): Promise<Config> {
    const latest = await this.configRepo.findOne({
      where: { brand: { id: brandId }, configKey },
      order: { version: 'DESC' },
    });

    if (!latest) throw new NotFoundException('Config not found');

    const newVersion = this.configRepo.create({
      ...latest,          // copy old config
      ...dto,             // override with new data
      brand: latest.brand,
      version: latest.version + 1,
      createdAt: undefined, // will be set automatically
    });

    return this.configRepo.save(newVersion);
  }

  async findLatest(brandId: number, configKey: string): Promise<Config> {
    return this.configRepo.findOne({
      where: { brand: { id: brandId }, configKey },
      order: { version: 'DESC' },
    });
  }

  async findAllVersions(brandId: number, configKey: string): Promise<Config[]> {
    return this.configRepo.find({
      where: { brand: { id: brandId }, configKey },
      order: { version: 'DESC' },
    });
  }
}