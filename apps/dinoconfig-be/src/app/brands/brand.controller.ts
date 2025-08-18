import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { BrandsService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';

@Controller('brands')
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Post(':userId')
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateBrandDto
  ) {
    return this.brandsService.create(userId, dto);
  }
}
