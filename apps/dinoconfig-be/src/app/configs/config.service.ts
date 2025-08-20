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

  async getBrandForUser(userId: number): Promise<Brand> {
    const brand = await this.brandRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!brand) throw new NotFoundException('Brand not found for this user');
    return brand;
  }

  async create(userId: number, dto: CreateConfigDto): Promise<Config> {
    const brand = await this.getBrandForUser(userId);

    const config = this.configRepo.create({
      ...dto,
      brand,
      configKey: dto.name.toLowerCase().replace(/\s+/g, '_'),
      version: 1,
    });

    return this.configRepo.save(config);
  }

  async update(userId: number, configKey: string, dto: UpdateConfigDto): Promise<Config> {
    const brand = await this.getBrandForUser(userId);

    const latest = await this.configRepo.findOne({
      where: { brand: { id: brand.id }, configKey },
      order: { version: 'DESC' },
    });

    if (!latest) throw new NotFoundException('Config not found');

    const newVersion = this.configRepo.create({
      ...latest,
      ...dto,
      brand: latest.brand,
      version: latest.version + 1,
      createdAt: undefined,
    });

    return this.configRepo.save(newVersion);
  }

  async findLatest(userId: number, configKey: string): Promise<Config> {
    const brand = await this.getBrandForUser(userId);

    return this.configRepo.findOne({
      where: { brand: { id: brand.id }, configKey },
      order: { version: 'DESC' },
    });
  }

  async findAllVersions(userId: number, configKey: string): Promise<Config[]> {
    const brand = await this.getBrandForUser(userId);

    return this.configRepo.find({
      where: { brand: { id: brand.id }, configKey },
      order: { version: 'DESC' },
    });
  }
}
