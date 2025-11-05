import { Module, forwardRef } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './entities/config.entity';
import { ActiveVersion } from './entities/active-version.entity';
import { ConfigsController } from './config.controller';
import { SdkConfigsController } from './sdk-config.controller';
import { ConfigsService } from './config.service';
import { BrandsModule } from '../brands/brands.module';
import { Brand } from '../brands/entities/brand.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { FeatureGuard } from '../subscriptions/guards/feature.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Config, Brand, ActiveVersion]),
    BrandsModule,
    forwardRef(() => SubscriptionsModule)
  ],
  controllers: [ConfigsController, SdkConfigsController],
  providers: [ConfigsService, FeatureGuard],
  exports: [ConfigsService, TypeOrmModule]
})
export class ConfigsModule {}
