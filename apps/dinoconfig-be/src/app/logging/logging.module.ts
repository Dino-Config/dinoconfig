import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import { LogContextGuard } from './log-context.guard';
import { redactError } from './redact-sensitive';

const SERVICE_NAME = 'backend-api';

/** Paths to redact from all log output (pino format). Prevents tokens/secrets in logs. */
const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'req.cookies',
  'res.headers.authorization',
  'res.headers["set-cookie"]',
  '*.token',
  '*.access_token',
  '*.refresh_token',
  '*.id_token',
  '*.password',
  '*.authorization',
  '*.apiKey',
  '*.api_key',
  '*.secret',
];

function pinoHttpOptions(configService: ConfigService) {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  return {
    level: isProduction ? 'info' : 'debug',
    redact: REDACT_PATHS,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true,
        translateTime: 'SYS:standard',
      },
    },
    autoLogging: false,
    genReqId: (req: any) => req.correlationId ?? uuidv4(),
    customProps: (req: any) => ({
      correlationId: req.correlationId ?? undefined,
      requestId: req.correlationId ?? undefined,
      service: SERVICE_NAME,
      method: req.method,
      path: req.url || req.path,
    }),
    serializers: {
      err: (err: Error) => redactError(err),
    },
  };
}

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: pinoHttpOptions(configService),
      }),
    }),
  ],
  providers: [LogContextGuard],
  exports: [PinoLoggerModule, LogContextGuard],
})
export class LoggingModule {}
