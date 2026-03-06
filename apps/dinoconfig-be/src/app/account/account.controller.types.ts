import { RequestWithCorrelation } from '../logging/logging.types';

/** User payload attached by UserAuthGuard (from JWT). */
export interface AuthenticatedUser {
  auth0Id: string;
  email?: string;
  name?: string;
  company?: string | null;
  scopes?: string[];
}

/** Request with authenticated user and optional correlation ID. */
export type AuthenticatedRequest = RequestWithCorrelation & {
  user: AuthenticatedUser;
};
