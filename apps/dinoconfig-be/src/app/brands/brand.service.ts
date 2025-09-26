import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { User } from '../users/entities/user.entity';
import { CreateBrandDto } from './dto/create-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(User) private userRepo: Repository<User>
  ) {}

  async findAllByUser(userId: number): Promise<Brand[]> {
    return this.brandRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' }
    });
  }

  async findAllByCompany(company: string): Promise<Brand[]> {
    return this.brandRepo.find({
      where: { company: company },
      order: { createdAt: 'DESC' }
    });
  }

  async findAllByAuth0Id(auth0Id: string): Promise<Brand[]> {
    return this.brandRepo.find({
      where: { user: { auth0Id } },
      order: { createdAt: 'DESC' }
    });
  }

  async create(dto: CreateBrandDto, companyName: string): Promise<Brand> {
    const brand = this.brandRepo.create({ 
      ...dto, 
      company: companyName 
    });
    
    return this.brandRepo.save(brand);
  }

  async findByIdAndUser(brandId: number, auth0Id: string): Promise<Brand | null> {
    return this.brandRepo.findOne({
      where: { 
        id: brandId,
        user: { auth0Id }
      },
      relations: ['user']
    });
  }
}
