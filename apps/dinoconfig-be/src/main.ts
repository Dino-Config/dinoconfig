/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  app.enableCors({
    origin: [configService.get<string>('CORS_ORIGIN' as any), configService.get<string>('CORS_ORIGIN_ORG' as any)],
    credentials: true
  });
  
  app.use((req, res, next) => {
    if (req.path === '/api/webhooks/stripe') {
      next();
    } else {
      json()(req, res, next);
    }
  });
  
  app.use('/api/webhooks/stripe', json({ verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }}));
  
  app.use(cookieParser());

  const port = configService.get<string>('PORT' as any) || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
