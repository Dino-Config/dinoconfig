import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UserJwtStrategy } from '../strategy/user-jwt.strategy';
import { MachineJwtStrategy } from '../strategy/machine-jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '../service/auth.service';
import { TokenBlacklistService } from '../service/token-blacklist.service';
import { TokenCleanupService } from '../service/token-cleanup.service';
import { ApiKeyService } from '../service/api-key.service';
import { SdkAuthService } from '../service/sdk-auth.service';
import { TokenBlacklist } from '../entities/token-blacklist.entity';
import { ApiKey } from '../entities/api-key.entity';
import { UsersModule } from '../../users/users.module';
import { ApiKeyController } from '../controller/api-key.controller';

@Module({
imports: [
    forwardRef(() => UsersModule),
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'user-jwt' }),
    TypeOrmModule.forFeature([TokenBlacklist, ApiKey]),
    ScheduleModule.forRoot()
],
controllers: [ApiKeyController],
providers: [
  UserJwtStrategy,
  MachineJwtStrategy,
  AuthService, 
  TokenBlacklistService, 
  TokenCleanupService,
  ApiKeyService,
  SdkAuthService,
],
exports: [PassportModule, AuthService, TokenBlacklistService, ApiKeyService, SdkAuthService],
})
export class AuthModule {}