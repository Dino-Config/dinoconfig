import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './entities/config.entity';
import { ConfigsController } from './config.controller';
import { ConfigsService } from './config.service';
import { BrandsModule } from '../brands/brands.module';
import { Brand } from '../brands/entities/brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Config, Brand]),
    BrandsModule
  ],
  controllers: [ConfigsController],
  providers: [ConfigsService],
})
export class ConfigsModule {}
