import { Controller, Post, Body, UseGuards, Req, Get, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { BrandsService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { JwtAuthGuard } from '../security/guard/jwt.guard';
import { brandHeaderExtractor } from '../security/jwt-extractor';
import { UsersService } from '../users/user.service';
import { SubscriptionService } from '../subscriptions/subscription.service';

@Controller('brands')
@UseGuards(JwtAuthGuard)
export class BrandsController {
  constructor(
    private brandsService: BrandsService,
    private usersService: UsersService,
    @Inject(forwardRef(() => SubscriptionService))
    private subscriptionService: SubscriptionService
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
    
    // Check if user has reached brand limit
    await this.subscriptionService.checkBrandLimit(user.id);
    
    return this.brandsService.create(dto, company, user.id);
  }
}