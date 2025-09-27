import { Controller, Post, Body, UseGuards, Req, Get, UnauthorizedException } from '@nestjs/common';
import { BrandsService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { JwtAuthGuard } from '../security/guard/jwt.guard';
import { brandHeaderExtractor } from '../security/jwt-extractor';
import { UsersService } from '../users/user.service';

@Controller('brands')
@UseGuards(JwtAuthGuard)
export class BrandsController {
  constructor(
    private brandsService: BrandsService,
    private usersService: UsersService
  ) {}

  @Get()
  async findAll(@Req() req) {
    const company = brandHeaderExtractor(req);
    if (!company) {
      throw new UnauthorizedException('X-INTERNAL-COMPANY header is required');
    }
    return this.brandsService.findAllByCompany(company);
  }

  @Post()
  async create(@Body() dto: CreateBrandDto, @Req() req) {
    const company = brandHeaderExtractor(req);
    if (!company) {
      throw new UnauthorizedException('X-INTERNAL-COMPANY header is required');
    }
    
    // Get user by auth0Id from JWT token
    const { auth0Id } = req.user;
    const user = await this.usersService.findByAuth0Id(auth0Id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    return this.brandsService.create(dto, company, user.id);
  }
}