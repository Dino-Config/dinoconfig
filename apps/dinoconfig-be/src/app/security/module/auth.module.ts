import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtStrategy } from '../jwt.strategy';
import { BlacklistJwtStrategy } from '../strategy/blacklist-jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '../service/auth.service';
import { TokenBlacklistService } from '../service/token-blacklist.service';
import { TokenCleanupService } from '../service/token-cleanup.service';
import { TokenBlacklist } from '../entities/token-blacklist.entity';
import { UsersModule } from '../../users/users.module';

@Module({
imports: [
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([TokenBlacklist]),
    ScheduleModule.forRoot()
],
providers: [BlacklistJwtStrategy, AuthService, TokenBlacklistService, TokenCleanupService],
exports: [PassportModule, AuthService, TokenBlacklistService],
})
export class AuthModule {}