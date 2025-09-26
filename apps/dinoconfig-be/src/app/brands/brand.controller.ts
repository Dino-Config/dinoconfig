import { Controller, Post, Body, UseGuards, Req, Get, UnauthorizedException } from '@nestjs/common';
import { BrandsService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { JwtAuthGuard } from '../security/guard/jwt.guard';
import { brandHeaderExtractor } from '../security/jwt-extractor';

@Controller('brands')
@UseGuards(JwtAuthGuard)
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

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
    return this.brandsService.create(dto, company);
  }
}