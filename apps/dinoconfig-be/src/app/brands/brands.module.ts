import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { BrandsController } from './brand.controller';
import { BrandsService } from './brand.service';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brand, User]),
    UsersModule
  ],
  controllers: [BrandsController],
  providers: [BrandsService],
})
export class BrandsModule {}
