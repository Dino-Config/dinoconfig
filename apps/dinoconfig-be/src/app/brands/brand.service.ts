import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { User } from '../users/entities/user.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandListResponseDto, BrandSummaryDto } from '../configs/dto/sdk-discovery.dto';
import { ConfigDefinition } from '../configs/entities/config-definition.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(ConfigDefinition) private configDefinitionRepo: Repository<ConfigDefinition>
  ) {}

  async findAllByUser(userId: number): Promise<Brand[]> {
    return this.brandRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' }
    });
  }

  async findAllByAuth0Id(auth0Id: string): Promise<Brand[]> {
    return this.brandRepo.find({
      where: { user: { auth0Id } },
      order: { createdAt: 'DESC' }
    });
  }

  async findAllByCompany(company: string): Promise<Brand[]> {
    return this.brandRepo.find({
      where: { company: company },
      order: { createdAt: 'DESC' }
    });
  }

  async create(dto: CreateBrandDto, companyName: string, userId: number): Promise<Brand> {
    const brand = this.brandRepo.create({ 
      ...dto, 
      company: companyName,
      user: { id: userId }
    });
    
    return this.brandRepo.save(brand);
  }

  async findByIdAndUser(brandId: number, userId: number): Promise<Brand | null> {
    return this.brandRepo.findOne({
      where: { 
        id: brandId,
        user: { id: userId }
      },
      relations: ['user']
    });
  }

  async listBrandsForSDK(company: string): Promise<BrandListResponseDto> {
    const brands = await this.findAllByCompany(company);

    const brandSummaries: BrandSummaryDto[] = await Promise.all(
      brands.map(async (brand) => {
        const configCount = await this.configDefinitionRepo.count({
          where: { brand: { id: brand.id }, company },
        });

        return {
          name: brand.name,
          description: brand.description,
          configCount,
          createdAt: brand.createdAt,
        };
      })
    );

    return {
      brands: brandSummaries,
      total: brandSummaries.length,
    };
  }
}
