import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../jwt.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' })],
providers: [JwtStrategy],
exports: [PassportModule],
})
export class AuthModule {}