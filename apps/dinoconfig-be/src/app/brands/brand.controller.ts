import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { BrandsService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { JwtAuthGuard } from '../security/guard/jwt.guard';

@Controller('brands')
@UseGuards(JwtAuthGuard)
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Post()
  async create(@Body() dto: CreateBrandDto, @Req() req) {
    return this.brandsService.create(req.user.id, dto);
  }
}