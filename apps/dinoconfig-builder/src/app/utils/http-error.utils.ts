/**
 * Extract a user-facing message from an HTTP error (e.g. from HttpClient).
 * Use for API error handling in modals and forms.
 */
export function getHttpErrorMessage(err: unknown, fallback: string): string {
  if (err == null) return fallback;
  const e = err as { error?: { message?: string }; message?: string };
  if (e?.error?.message && typeof e.error.message === 'string') return e.error.message;
  if (e?.message && typeof e.message === 'string') return e.message;
  return fallback;
}
