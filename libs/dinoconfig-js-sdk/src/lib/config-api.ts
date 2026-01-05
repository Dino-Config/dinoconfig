/**
 * @fileoverview Configuration API for the DinoConfig SDK.
 * Provides methods for retrieving configuration values.
 * @module @dinoconfig/dinoconfig-js-sdk/config-api
 * @version 1.0.0
 */

import { HttpClient } from './http-client';
import { ApiResponse, RequestOptions } from './types';

/**
 * Configuration API class for interacting with DinoConfig configurations.
 * 
 * This class provides methods to retrieve configuration values from the
 * DinoConfig API. It handles request formatting, error handling, and
 * response parsing automatically.
 * 
 * @class ConfigAPI
 * @example
 * ```typescript
 * // ConfigAPI is accessed through the SDK instance
 * const dinoconfig = await dinoconfigApi({ apiKey: 'dino_...' });
 * 
 * // Use the configs API
 * const response = await dinoconfig.configs.getConfigValue(
 *   'MyBrand',
 *   'AppSettings',
 *   'theme'
 * );
 * 
 * console.log('Theme:', response.data); // e.g., 'dark'
 * ```
 */
export class ConfigAPI {
  /**
   * Creates a new ConfigAPI instance.
   * 
   * @param {HttpClient} httpClient - The HTTP client for making API requests
   * @internal This constructor is called internally by the SDK
   */
  constructor(private httpClient: HttpClient) {}

  /**
   * Retrieves a specific configuration value from DinoConfig.
   * 
   * This method fetches a single value from a configuration by specifying
   * the brand name, configuration name, and the key within the configuration.
   * 
   * @async
   * @method getConfigValue
   * @param {string} brandName - The name of the brand containing the configuration
   * @param {string} configName - The name of the configuration
   * @param {string} configValueKey - The key of the specific value to retrieve
   * @param {RequestOptions} [options] - Optional request configuration
   * @returns {Promise<ApiResponse<any>>} A Promise resolving to the API response with the config value
   * @throws {ApiError} If the request fails (e.g., 401, 403, 404, 500)
   * 
   * @example Basic usage
   * ```typescript
   * const response = await dinoconfig.configs.getConfigValue(
   *   'Acme',           // brand name
   *   'AppSettings',    // config name
   *   'theme'           // config value key
   * );
   * 
   * if (response.success) {
   *   console.log('Theme:', response.data); // 'dark'
   * }
   * ```
   * 
   * @example Retrieving a feature flag
   * ```typescript
   * const response = await dinoconfig.configs.getConfigValue(
   *   'MyApp',
   *   'FeatureFlags',
   *   'enableBetaFeatures'
   * );
   * 
   * const isBetaEnabled = response.data === true;
   * if (isBetaEnabled) {
   *   // Show beta features
   * }
   * ```
   * 
   * @example With custom request options
   * ```typescript
   * const response = await dinoconfig.configs.getConfigValue(
   *   'MyBrand',
   *   'CriticalConfig',
   *   'databaseUrl',
   *   {
   *     timeout: 30000,  // 30 second timeout
   *     retries: 5,      // Retry up to 5 times
   *     headers: {
   *       'X-Request-ID': 'unique-id-123'
   *     }
   *   }
   * );
   * ```
   * 
   * @example Error handling
   * ```typescript
   * try {
   *   const response = await dinoconfig.configs.getConfigValue(
   *     'MyBrand',
   *     'MyConfig',
   *     'myKey'
   *   );
   *   console.log('Value:', response.data);
   * } catch (error: any) {
   *   if (error.status === 404) {
   *     console.log('Configuration or key not found');
   *   } else if (error.status === 401) {
   *     console.log('Unauthorized - check your API key');
   *   } else {
   *     console.log('Error:', error.message);
   *   }
   * }
   * ```
   * 
   * @example Conditional logic based on config value
   * ```typescript
   * async function getMaxUploadSize(): Promise<number> {
   *   const response = await dinoconfig.configs.getConfigValue(
   *     'MyApp',
   *     'Limits',
   *     'maxUploadSizeMB'
   *   );
   *   
   *   // Convert to bytes, default to 10MB if not found
   *   return (response.data ?? 10) * 1024 * 1024;
   * }
   * ```
   * 
   * @see {@link RequestOptions} for available request customization options
   * @see {@link ApiResponse} for the response structure
   */
  async getConfigValue(
    brandName: string,
    configName: string,
    configValueKey: string,
    options?: RequestOptions
  ): Promise<ApiResponse<any>> {
    const response = await this.httpClient.get<any>(
      `/api/sdk/brands/${brandName}/configs/${configName}/${configValueKey}`,
      options
    );
    return response;
  }
}
