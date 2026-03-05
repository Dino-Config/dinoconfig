import { Request } from 'express';

/** Request extended with correlation ID set by CorrelationIdMiddleware */
export interface RequestWithCorrelation extends Request {
  correlationId?: string;
}

/** Minimal request context included in log payloads */
export interface RequestLogContext {
  method: string;
  path: string;
  correlationId?: string;
}

/** Extract log context from an HTTP request (DRY for filter + interceptor) */
export function getRequestLogContext(req: RequestWithCorrelation): RequestLogContext {
  return {
    method: req.method,
    path: req.url || req.path,
    correlationId: req.correlationId,
  };
}
