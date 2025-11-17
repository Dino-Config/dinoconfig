import { Module, forwardRef } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './entities/config.entity';
import { ActiveVersion } from './entities/active-version.entity';
import { ConfigsController } from './config.controller';
import { ConfigDefinitionController } from './config-definition.controller';
import { SdkConfigsController } from './sdk-config.controller';
import { ConfigsService } from './config.service';
import { ConfigDefinitionService } from './config-definition.service';
import { BrandsModule } from '../brands/brands.module';
import { Brand } from '../brands/entities/brand.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { FeatureGuard } from '../subscriptions/guards/feature.guard';
import { ConfigDefinition } from './entities/config-definition.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Config, Brand, ActiveVersion, ConfigDefinition]),
    BrandsModule,
    UsersModule,
    forwardRef(() => SubscriptionsModule)
  ],
  controllers: [ConfigsController, ConfigDefinitionController, SdkConfigsController],
  providers: [ConfigDefinitionService, ConfigsService, FeatureGuard],
  exports: [ConfigDefinitionService, ConfigsService, TypeOrmModule]
})
export class ConfigsModule {}
