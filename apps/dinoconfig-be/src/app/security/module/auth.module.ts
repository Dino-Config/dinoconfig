import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '../service/auth.service';
import { UsersModule } from '../../users/users.module';

@Module({
imports: [
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' })
],
providers: [JwtStrategy, AuthService],
exports: [PassportModule, AuthService],
})
export class AuthModule {}