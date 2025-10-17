import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { BrandsController } from './brand.controller';
import { BrandsService } from './brand.service';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brand, User]),
    UsersModule,
    forwardRef(() => SubscriptionsModule)
  ],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [BrandsService, TypeOrmModule]
})
export class BrandsModule {}
