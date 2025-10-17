import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './security/module/auth.module';
import { AuthController } from './security/controller/auth.controller';
import { UsersModule } from './users/users.module';
import { BrandsModule } from './brands/brands.module';
import { ConfigsModule } from './configs/configs.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, BrandsModule, ConfigsModule, SubscriptionsModule],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
