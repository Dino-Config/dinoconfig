import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './security/module/auth.module';
import { AuthController } from './security/controller/service.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
