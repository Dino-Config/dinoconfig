import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RequestWithCorrelation } from './logging.types';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Ensures every request has a correlation ID (UUID v4).
 * Uses x-correlation-id header if provided, otherwise generates one. Stores on request and sets response header.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incomingId = req.headers[CORRELATION_ID_HEADER];
    const correlationId =
      typeof incomingId === 'string' && incomingId.trim()
        ? incomingId.trim()
        : uuidv4();

    (req as RequestWithCorrelation).correlationId = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  }
}
