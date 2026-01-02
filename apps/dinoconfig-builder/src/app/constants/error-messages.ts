/**
 * Centralized error messages for the Angular frontend.
 * These messages are designed to prevent user enumeration attacks
 * by using generic, non-revealing error messages for authentication flows.
 */

export const ErrorMessages = {
  // Authentication errors
  AUTH: {
    LOGIN_FAILED: 'Login failed. Please try again.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    SIGNUP_FAILED: 'Unable to create account. Please try again.',
    CONNECTION_ERROR: 'Unable to connect to server. Please check your connection.',
    FORGOT_PASSWORD_FAILED: 'Failed to send password reset email. Please try again.',
    VERIFICATION_FAILED: 'Failed to resend verification email. Please try again.',
    VERIFICATION_CHECK_FAILED: 'Failed to check verification status. Please try again.',
  },

  // Generic errors
  GENERIC: {
    FAILED_TO_LOAD: 'Failed to load data. Please try again.',
    FAILED_TO_SAVE: 'Failed to save. Please try again.',
    FAILED_TO_DELETE: 'Failed to delete. Please try again.',
  },

  // Brand errors
  BRAND: {
    FAILED_TO_LOAD: 'Failed to load brands',
    FAILED_TO_CREATE: 'Failed to create brand',
  },

  // Config errors
  CONFIG: {
    FAILED_TO_LOAD: 'Failed to load configs',
    FAILED_TO_CREATE: 'Failed to create config',
    FAILED_TO_DELETE: 'Failed to delete configuration',
    FAILED_TO_RENAME: 'Failed to rename configuration',
    FAILED_TO_SAVE: 'Failed to save config',
    FAILED_TO_SET_VERSION: 'Failed to set active version',
    FIELD_NOT_FOUND: 'Field not found',
    NO_CONFIG_SELECTED: 'No configuration selected',
    INVALID_ROUTE: 'Invalid route parameters',
  },

  // API Key errors
  API_KEY: {
    FAILED_TO_CREATE: 'Failed to create API key. Please try again.',
  },

  // Subscription errors
  SUBSCRIPTION: {
    FAILED_TO_REFRESH: 'Failed to refresh subscription status',
    FAILED_TO_LOAD: 'Unable to load subscription details',
  },

  // User errors
  USER: {
    FAILED_TO_LOAD: 'Failed to load user data',
  },
} as const;

