/**
 * @fileoverview Type definitions for the DinoConfig JavaScript SDK.
 * Contains all interfaces and types used throughout the SDK.
 * @module @dinoconfig/dinoconfig-js-sdk/types
 * @version 1.0.0
 */

/**
 * Configuration options for initializing the DinoConfig SDK.
 * 
 * @interface DinoConfigSDKConfig
 * @example
 * ```typescript
 * const config: DinoConfigSDKConfig = {
 *   apiKey: 'dino_your-api-key-here',
 *   baseUrl: 'https://api.dinoconfig.com',
 *   timeout: 15000
 * };
 * ```
 */
export interface DinoConfigSDKConfig {
  /**
   * The API key for authentication.
   * Obtain this from your DinoConfig dashboard under Settings > SDK & API Keys.
   * 
   * @remarks
   * - API keys are prefixed with `dino_`
   * - Keep your API key secure and never expose it in client-side code
   * - Use environment variables in production
   * 
   * @example 'dino_abc123def456...'
   */
  apiKey: string;

  /**
   * The base URL of the DinoConfig API.
   * 
   * @default 'http://localhost:3000'
   * @example 'https://api.dinoconfig.com'
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * If a request takes longer than this, it will be aborted.
   * 
   * @default 10000
   * @example 15000 // 15 seconds
   */
  timeout?: number;
}

/**
 * Response from the token exchange endpoint.
 * Used internally when exchanging an API key for an access token.
 * 
 * @interface TokenExchangeResponse
 * @internal
 */
export interface TokenExchangeResponse {
  /**
   * The JWT access token to use for API requests.
   */
  access_token: string;

  /**
   * Token expiration time in seconds.
   */
  expires_in: number;

  /**
   * The type of token (typically 'Bearer').
   */
  token_type: string;

  /**
   * The company/organization associated with the API key.
   */
  company?: string;
}

/**
 * Represents a configuration object in DinoConfig.
 * 
 * @interface Config
 * @example
 * ```typescript
 * const config: Config = {
 *   id: 1,
 *   name: 'AppSettings',
 *   description: 'Main application settings',
 *   formData: { theme: 'dark', language: 'en' },
 *   version: 3,
 *   createdAt: new Date('2024-01-15'),
 *   brand: { id: 1, name: 'MyBrand' }
 * };
 * ```
 */
export interface Config {
  /**
   * Unique identifier for the configuration.
   */
  id: number;

  /**
   * Human-readable name of the configuration.
   */
  name: string;

  /**
   * Optional description explaining the configuration's purpose.
   */
  description?: string;

  /**
   * The company/organization that owns this configuration.
   */
  company?: string;

  /**
   * The actual configuration data as key-value pairs.
   * This can contain nested objects and arrays.
   */
  formData: Record<string, any>;

  /**
   * JSON Schema defining the structure of formData.
   * Used for validation and form generation.
   */
  schema?: Record<string, any>;

  /**
   * UI Schema for customizing form rendering.
   * Used by JSON Schema Form libraries.
   */
  uiSchema?: Record<string, any>;

  /**
   * Version number of this configuration.
   * Incremented on each update.
   */
  version: number;

  /**
   * Timestamp when this configuration was created.
   */
  createdAt: Date;

  /**
   * The brand this configuration belongs to.
   */
  brand: {
    /** Brand's unique identifier */
    id: number;
    /** Brand's name */
    name: string;
  };
}

/**
 * Data transfer object for creating a new configuration.
 * 
 * @interface CreateConfigDto
 * @example
 * ```typescript
 * const newConfig: CreateConfigDto = {
 *   name: 'FeatureFlags',
 *   description: 'Feature flag settings',
 *   formData: { enableBeta: false, maxUsers: 100 }
 * };
 * ```
 */
export interface CreateConfigDto {
  /**
   * Name for the new configuration.
   * Must be unique within the brand.
   */
  name: string;

  /**
   * Optional description of the configuration.
   */
  description?: string;

  /**
   * The configuration data to store.
   */
  formData: Record<string, any>;

  /**
   * Optional JSON Schema for validation.
   */
  schema?: Record<string, any>;

  /**
   * Optional UI Schema for form rendering.
   */
  uiSchema?: Record<string, any>;
}

/**
 * Data transfer object for updating an existing configuration.
 * All fields are optional - only provided fields will be updated.
 * 
 * @interface UpdateConfigDto
 * @example
 * ```typescript
 * const updates: UpdateConfigDto = {
 *   formData: { enableBeta: true } // Only update formData
 * };
 * ```
 */
export interface UpdateConfigDto {
  /**
   * New name for the configuration.
   */
  name?: string;

  /**
   * New description.
   */
  description?: string;

  /**
   * Updated configuration data.
   */
  formData?: Record<string, any>;

  /**
   * Updated JSON Schema.
   */
  schema?: Record<string, any>;

  /**
   * Updated UI Schema.
   */
  uiSchema?: Record<string, any>;
}

/**
 * Standard API response wrapper.
 * All SDK methods return data wrapped in this structure.
 * 
 * @interface ApiResponse
 * @typeParam T - The type of data contained in the response
 * @example
 * ```typescript
 * const response: ApiResponse<string> = {
 *   data: 'dark',
 *   success: true
 * };
 * 
 * if (response.success) {
 *   console.log('Theme:', response.data);
 * }
 * ```
 */
export interface ApiResponse<T = any> {
  /**
   * The response payload.
   * Contains the requested data on success.
   */
  data: T;

  /**
   * Indicates whether the request was successful.
   * `true` for 2xx responses, `false` otherwise.
   */
  success: boolean;

  /**
   * Optional message providing additional context.
   * Typically populated for errors or warnings.
   */
  message?: string;
}

/**
 * Structured error object thrown by the SDK.
 * Provides detailed information about what went wrong.
 * 
 * @interface ApiError
 * @example
 * ```typescript
 * try {
 *   await dinoconfig.configs.getConfigValue('brand', 'config', 'key');
 * } catch (error) {
 *   const apiError = error as ApiError;
 *   console.error(`Error ${apiError.status}: ${apiError.message}`);
 *   if (apiError.code === 'CONFIG_NOT_FOUND') {
 *     // Handle specific error
 *   }
 * }
 * ```
 */
export interface ApiError {
  /**
   * Human-readable error message describing what went wrong.
   */
  message: string;

  /**
   * HTTP status code of the error response.
   * 
   * @example
   * - 400: Bad Request
   * - 401: Unauthorized
   * - 403: Forbidden
   * - 404: Not Found
   * - 429: Too Many Requests
   * - 500: Internal Server Error
   */
  status: number;

  /**
   * Optional error code for programmatic error handling.
   * 
   * @example 'CONFIG_NOT_FOUND', 'INVALID_API_KEY', 'RATE_LIMITED'
   */
  code?: string;
}

/**
 * Options for customizing individual API requests.
 * 
 * @interface RequestOptions
 * @example
 * ```typescript
 * const options: RequestOptions = {
 *   timeout: 5000,
 *   retries: 3,
 *   headers: { 'X-Request-ID': 'abc123' }
 * };
 * 
 * const response = await dinoconfig.configs.getConfigValue(
 *   'brand', 'config', 'key', options
 * );
 * ```
 */
export interface RequestOptions {
  /**
   * Custom headers to include in this specific request.
   * These are merged with default headers.
   */
  headers?: Record<string, string>;

  /**
   * Request timeout in milliseconds.
   * Overrides the default timeout set during SDK initialization.
   */
  timeout?: number;

  /**
   * Number of retry attempts for failed requests.
   * Uses exponential backoff between retries.
   * 
   * @remarks
   * - Only server errors (5xx) and network errors are retried
   * - Client errors (4xx) are not retried
   * - Backoff formula: `2^attempt * 1000ms`
   * 
   * @default 0
   * @example 3 // Retry up to 3 times
   */
  retries?: number;
}
