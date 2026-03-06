import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestWithCorrelation, getRequestLogContext } from './logging.types';
import { redactExceptionMessage, redactError } from './redact-sensitive';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<RequestWithCorrelation>();
    const ctxLog = getRequestLogContext(req);

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = isHttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    const errorMessage = redactExceptionMessage(responseBody);
    const redacted = redactError(exception instanceof Error ? exception : undefined);

    this.logger.error({
      message: 'Unhandled exception',
      ...ctxLog,
      statusCode: status,
      errorMessage,
      stack: redacted.stack,
    });

    const body =
      typeof responseBody === 'object' && responseBody !== null
        ? responseBody
        : { message: responseBody };
    res.status(status).json(body);
  }
}
