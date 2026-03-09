/**
 * Account closure rate limit and worker constants.
 * Can be moved to ConfigService/env later for per-environment tuning.
 */

/** Rate limit: time window in milliseconds (e.g. 15 minutes). */
export const ACCOUNT_CLOSURE_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

/** Rate limit: max attempts per IP within the window. */
export const ACCOUNT_CLOSURE_RATE_LIMIT_MAX_ATTEMPTS = 5;

/** Cron expression for permanent deletion job (daily at 02:00). */
export const ACCOUNT_DELETION_CRON = '0 2 * * *';
