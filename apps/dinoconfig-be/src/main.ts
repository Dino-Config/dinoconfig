/**
 * Production-ready NestJS backend with structured JSON logging and correlation IDs.
 */

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { CorrelationIdMiddleware } from './app/logging';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    rawBody: true, // Required for Stripe webhook signature verification (exact raw body must be used)
  });

  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);

  const correlationIdMiddleware = new CorrelationIdMiddleware();
  app.use((req, res, next) => correlationIdMiddleware.use(req, res, next));

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.enableCors({
    origin: [
      configService.get<string>('CORS_ORIGIN' as any),
      configService.get<string>('CORS_ORIGIN_ORG' as any),
    ],
    credentials: true,
  });

  app.use(cookieParser());

  const port = configService.get<string>('PORT' as any) || 3000;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();