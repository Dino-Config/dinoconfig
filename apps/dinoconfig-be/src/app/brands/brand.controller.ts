import { Controller, Post, Body, UseGuards, Req, Get, UnauthorizedException, Inject, forwardRef, Header } from '@nestjs/common';
import { BrandsService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UserAuthGuard } from '../security/guard/user-auth.guard';
import { brandHeaderExtractor } from '../security/jwt-extractor';
import { UsersService } from '../users/user.service';
import { SubscriptionService } from '../subscriptions/subscription.service';
import { ErrorMessages } from '../constants/error-messages';

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
  async findAll(@Req() req) {
    const company = brandHeaderExtractor(req);
    if (!company) {
      throw new UnauthorizedException(ErrorMessages.AUTHORIZATION.COMPANY_HEADER_REQUIRED);
    }
    
    // Get user by auth0Id from JWT token
    const { auth0Id } = req.user;
    const user = await this.usersService.findByAuth0Id(auth0Id);
    if (!user) {
      throw new UnauthorizedException(ErrorMessages.AUTH.AUTHENTICATION_FAILED);
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

  @Post()
  async create(@Body() dto: CreateBrandDto, @Req() req) {
    const company = brandHeaderExtractor(req);
    if (!company) {
      throw new UnauthorizedException(ErrorMessages.AUTHORIZATION.COMPANY_HEADER_REQUIRED);
    }
    
    // Get user by auth0Id from JWT token
    const { auth0Id } = req.user;
    const user = await this.usersService.findByAuth0Id(auth0Id);
    if (!user) {
      throw new UnauthorizedException(ErrorMessages.AUTH.AUTHENTICATION_FAILED);
    }
    
    // Check if user has reached brand limit
    await this.subscriptionService.checkBrandLimit(user.id);
    
    return this.brandsService.create(dto, company, user.id);
  }
}