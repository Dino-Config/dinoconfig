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

  async create(userId: number, dto: CreateBrandDto): Promise<Brand> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const brand = this.brandRepo.create({ ...dto, user });
    return this.brandRepo.save(brand);
  }
}
