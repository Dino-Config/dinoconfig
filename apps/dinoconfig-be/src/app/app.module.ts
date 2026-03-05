import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './security/module/auth.module';
import { AuthController } from './security/controller/auth.controller';
import { UsersModule } from './users/users.module';
import { BrandsModule } from './brands/brands.module';
import { ConfigsModule } from './configs/configs.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import {
  LoggingModule,
  RequestLoggingInterceptor,
  GlobalHttpExceptionFilter,
} from './logging';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    BrandsModule,
    ConfigsModule,
    SubscriptionsModule,
    LoggingModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalHttpExceptionFilter,
    },
  ],
})
export class AppModule {}
