import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

  async getBrandForUser(userId: number, brandName: string): Promise<Brand> {
    const brand = await this.brandRepo.findOne({
      where: { user: { id: userId }, name: brandName },
    });

    if (!brand) {
      throw new NotFoundException(`Brand "${brandName}" not found for this user`);
    }

    return brand;
  }

  async create(userId: number, brandName: string, dto: CreateConfigDto): Promise<Config> {
    const brand = await this.getBrandForUser(userId, brandName);
  
    const configKey = dto.name.toLowerCase().replace(/\s+/g, '_');
  
    const existing = await this.configRepo.findOne({
      where: { brand: { id: brand.id }, configKey },
    });
  
    if (existing) {
      throw new ConflictException(
        `Config with name "${dto.name}" already exists for brand "${brandName}"`,
      );
    }
  
    const config = this.configRepo.create({
      ...dto,
      data: dto.data ?? {},
      brand,
      configKey,
      version: 1,
    });
  
    return this.configRepo.save(config);
  }

  async update(
    userId: number,
    brandName: string,
    configKey: string,
    dto: UpdateConfigDto,
  ): Promise<Config> {
    const brand = await this.getBrandForUser(userId, brandName);

    const latest = await this.configRepo.findOne({
      where: { brand: { id: brand.id }, configKey },
      order: { version: 'DESC' },
    });

    if (!latest) {
      throw new NotFoundException(`Config "${configKey}" not found`);
    }

    const newVersion = this.configRepo.create({
      ...latest,
      ...dto,
      brand: latest.brand,
      version: latest.version + 1,
      createdAt: undefined, // let DB generate timestamp
    });

    return this.configRepo.save(newVersion);
  }

  async findLatest(userId: number, brandName: string, configKey: string): Promise<Config> {
    const brand = await this.getBrandForUser(userId, brandName);

    const latest = await this.configRepo.findOne({
      where: { brand: { id: brand.id }, configKey },
      order: { version: 'DESC' },
    });

    if (!latest) {
      throw new NotFoundException(`Config "${configKey}" not found`);
    }

    return latest;
  }

  async findAllVersions(userId: number, brandName: string, configKey: string): Promise<Config[]> {
    const brand = await this.getBrandForUser(userId, brandName);

    return this.configRepo.find({
      where: { brand: { id: brand.id }, configKey },
      order: { version: 'DESC' },
    });
  }

  async findAllKeys(userId: number, brandName: string): Promise<string[]> {
    const brand = await this.getBrandForUser(userId, brandName);
    return this.configRepo.find({ where: { brand: { id: brand.id } } }).then(configs => configs.map(c => c.configKey));
  }
}