/**
 * Account closure feature constants.
 * Use these instead of magic numbers/strings for grace period and user-facing messages.
 */

export const ACCOUNT_GRACE_DAYS = 30;

/** Length of restore token in characters (32 bytes hex = 64 chars). */
export const RESTORE_TOKEN_LENGTH = 64;

/** User-facing message when account is successfully closed (include grace period). */
export const ACCOUNT_CLOSE_SUCCESS_MESSAGE = `Your account has been closed and scheduled for permanent deletion in ${ACCOUNT_GRACE_DAYS} days. You can restore it within this period.`;

/** User-facing message when account is successfully restored. */
export const ACCOUNT_RESTORE_SUCCESS_MESSAGE = 'Your account has been restored successfully. You can log in again.';
