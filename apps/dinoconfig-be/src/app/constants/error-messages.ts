/**
 * Centralized error messages for the application.
 * These messages are designed to prevent user enumeration attacks
 * by using generic, non-revealing error messages for authentication flows.
 */

export const ErrorMessages = {
  // Authentication errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid credentials',
    AUTHENTICATION_FAILED: 'Authentication failed',
    UNABLE_TO_COMPLETE_AUTH: 'Unable to complete authentication. Please contact support.',
    NO_REFRESH_TOKEN: 'No refresh token provided',
    INVALID_REFRESH_TOKEN: 'Invalid refresh token',
    API_KEY_REQUIRED: 'API key is required',
  },

  // Authorization errors
  AUTHORIZATION: {
    COMPANY_HEADER_REQUIRED: 'X-INTERNAL-COMPANY header is required',
    MAX_VERIFICATION_ATTEMPTS: 'You have reached the maximum number of verification email attempts (3). Please contact support for assistance.',
  },

  // Generic operation errors
  OPERATION: {
    UNABLE_TO_COMPLETE: 'Unable to complete operation',
  },

  // Subscription errors
  SUBSCRIPTION: {
    NO_STRIPE_CUSTOMER: 'No Stripe customer found',
    NO_ACTIVE_SUBSCRIPTION: 'No active subscription found',
    FAILED_TO_CHANGE_PLAN: 'Failed to change subscription plan. Please try again.',
    FAILED_TO_CANCEL: 'Failed to cancel subscription. Please try again.',
    FAILED_TO_CLEANUP_FREE: 'Failed to cleanup FREE subscriptions. Please try again.',
    NOT_FOUND: 'Subscription not found',
    PRICE_ID_REQUIRED: 'Price ID is required in request body',
  },

  // Config errors
  CONFIG: {
    NOT_FOUND: (id: string | number) => `Config with ID "${id}" not found`,
    NAME_NOT_FOUND: (name: string, brand: string) => `Config "${name}" not found for brand "${brand}"`,
    VERSION_NOT_FOUND: (name: string, version: string, brand: string, availableVersions: string) => 
      `Config "${name}" version "${version}" not found for this brand. Available versions: ${availableVersions}`,
    DEFINITION_NOT_FOUND: 'Config definition not found',
    DEFINITION_ID_NOT_FOUND: (id: string | number) => `Config definition with ID "${id}" not found`,
    NAME_ALREADY_EXISTS: (name: string) => `Config with name "${name}" already exists`,
  },

  // Brand errors
  BRAND: {
    NOT_FOUND: (id: string | number) => `Brand with ID "${id}" not found`,
    NAME_NOT_FOUND: (name: string) => `Brand with name "${name}" not found`,
    NAME_NOT_FOUND_FOR_USER: (name: string) => `Brand with name "${name}" not found for this user`,
    ID_NOT_FOUND_FOR_USER: (id: string | number) => `Brand with ID "${id}" not found for this user`,
  },

  // API Key errors
  API_KEY: {
    NOT_FOUND: 'API key not found',
    NAME_ALREADY_EXISTS: (name: string) => `API key with name "${name}" already exists`,
  },

  // External service errors
  EXTERNAL: {
    FAILED_TO_GET_MANAGEMENT_TOKEN: 'Failed to get management token',
    FAILED_TO_GET_SDK_TOKEN: 'Failed to get SDK token',
    FAILED_TO_CREATE_USER: 'Failed to create user',
    FAILED_TO_FETCH_USER: 'Failed to fetch user',
    FAILED_TO_SEND_RESET_EMAIL: 'Failed to send reset password email',
    FAILED_TO_SEND_VERIFICATION: 'Failed to send verification email',
  },
} as const;

