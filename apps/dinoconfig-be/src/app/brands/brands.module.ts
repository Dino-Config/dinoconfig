import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { BrandsController } from './brand.controller';
import { BrandsService } from './brand.service';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ConfigDefinition } from '../configs/entities/config-definition.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brand, User, ConfigDefinition]),
    UsersModule,
    forwardRef(() => SubscriptionsModule)
  ],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [BrandsService, TypeOrmModule]
})
export class BrandsModule {}
