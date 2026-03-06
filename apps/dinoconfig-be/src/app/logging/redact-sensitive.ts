/**
 * Redact sensitive values from data before logging.
 * Prevents tokens, passwords, and other secrets from appearing in log output.
 */

const REDACTED = '[REDACTED]';

const SENSITIVE_KEYS = new Set([
  'token', 'access_token', 'accessToken', 'refresh_token', 'refreshToken',
  'id_token', 'idToken', 'password', 'authorization', 'cookie', 'cookies',
  'apiKey', 'api_key', 'secret', 'credentials', 'bearer',
]);

/** JWT-like pattern (header.payload.signature) */
const JWT_PATTERN = /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.has(lower) || lower.includes('token') || lower.includes('password');
}

/**
 * Redact token-like substrings from a string (e.g. JWT in error messages).
 * Returns empty string for null/undefined.
 */
export function redactSensitiveString(value: string | undefined | null): string {
  if (value == null || typeof value !== 'string') return '';
  const out = value.replace(JWT_PATTERN, REDACTED).trim();
  return out || REDACTED;
}

/**
 * Redact sensitive keys from an object (shallow). Values replaced with [REDACTED].
 */
export function redactSensitiveObject<T extends Record<string, unknown>>(
  obj: T | null | undefined
): T {
  if (obj == null || typeof obj !== 'object') return obj as T;
  const out = { ...obj } as Record<string, unknown>;
  for (const key of Object.keys(out)) {
    if (isSensitiveKey(key)) out[key] = REDACTED;
  }
  return out as T;
}

/**
 * Redact sensitive fields from a value (string or object). Use for error messages and response bodies.
 */
export function redactForLog(value: unknown): string | Record<string, unknown> {
  if (value == null) return '';
  if (typeof value === 'string') return redactSensitiveString(value);
  if (typeof value === 'object' && !Array.isArray(value)) {
    return redactSensitiveObject(value as Record<string, unknown>) as Record<string, unknown>;
  }
  return redactSensitiveString(String(value));
}

/** Serialized error shape for logs (message and stack redacted) */
export interface RedactedErrorLog {
  type?: string;
  message?: string;
  stack?: string;
}

/**
 * Serialize an Error for safe logging (redacts message and stack).
 * Single place for err serializer and request-failed logging.
 */
export function redactError(err: Error | null | undefined): RedactedErrorLog {
  if (err == null) return {};
  return {
    type: err?.name,
    message: err?.message ? redactSensitiveString(err.message) : undefined,
    stack: err?.stack ? redactSensitiveString(err.stack) : undefined,
  };
}

/**
 * Extract and redact error message from HttpException response body (string | string[] | object).
 */
export function redactExceptionMessage(responseBody: unknown): string {
  if (responseBody == null) return '';
  if (typeof responseBody !== 'object') return redactSensitiveString(String(responseBody));
  const msg = (responseBody as { message?: string | string[] }).message;
  if (msg == null) return redactSensitiveString(JSON.stringify(responseBody));
  if (typeof msg === 'string') return redactSensitiveString(msg);
  return msg.map((m) => redactSensitiveString(String(m))).join(', ');
}
