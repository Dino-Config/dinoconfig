import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestWithCorrelation, getRequestLogContext } from './logging.types';
import { redactError } from './redact-sensitive';

const SLOW_REQUEST_MS = 1000;

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<RequestWithCorrelation>();
    const res = http.getResponse();
    const ctx = getRequestLogContext(req);
    const start = Date.now();

    this.logger.log({ message: 'Incoming request', ...ctx });

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - start;
          const statusCode = res.statusCode;
          this.logger.log({
            message: 'Request completed',
            ...ctx,
            statusCode,
            durationMs,
          });
          if (durationMs >= SLOW_REQUEST_MS) {
            this.logger.warn({
              message: 'Slow request detected',
              ...ctx,
              durationMs,
              thresholdMs: SLOW_REQUEST_MS,
            });
          }
        },
        error: (err: Error) => {
          const durationMs = Date.now() - start;
          const redacted = redactError(err);
          this.logger.error({
            message: 'Request failed',
            ...ctx,
            durationMs,
            error: redacted.message,
            stack: redacted.stack,
          });
        },
      })
    );
  }
}
