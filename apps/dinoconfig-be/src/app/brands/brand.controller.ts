import { Controller, Post, Body, UseGuards, Req, Get, UnauthorizedException, Inject, forwardRef, Header, Param, NotFoundException } from '@nestjs/common';
import { BrandsService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UserAuthGuard } from '../security/guard/user-auth.guard';
import { brandHeaderExtractor } from '../security/jwt-extractor';
import { UsersService } from '../users/user.service';
import { SubscriptionService } from '../subscriptions/subscription.service';

@Controller('brands')
@UseGuards(UserAuthGuard)
export class BrandsController {
  constructor(
    private brandsService: BrandsService,
    private usersService: UsersService,
    @Inject(forwardRef(() => SubscriptionService))
    private subscriptionService: SubscriptionService
  ) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=120, must-revalidate, immutable')
  async findAll(@Req() req) {
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
    
    // Check for limit violations
    const violations = await this.subscriptionService.checkLimitViolations(user.id);
    if (violations.hasViolations) {
      // Return brands with violation info
      const brands = await this.brandsService.findAllByCompany(company);
      return {
        brands,
        limitViolations: violations
      };
    }
    
    return this.brandsService.findAllByCompany(company);
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    const company = brandHeaderExtractor(req);
    if (!company) {
      throw new UnauthorizedException('X-INTERNAL-COMPANY header is required');
    }
    
    const brandId = parseInt(id);
    if (isNaN(brandId)) {
      throw new UnauthorizedException('Invalid brand ID');
    }
    
    const brand = await this.brandsService.findByIdAndCompany(brandId, company);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    
    return brand;
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