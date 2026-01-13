/**
 * @fileoverview Main entry point for the DinoConfig JavaScript SDK.
 * Provides the factory function for creating SDK instances.
 * @module @dinoconfig/dinoconfig-js-sdk
 * @version 1.0.0
 * @license MIT
 */

import { HttpClient } from './http-client';
import { ConfigAPI } from './config-api';
import { DiscoveryAPI } from './discovery-api';
import { DinoConfigSDKConfig } from './types';

/**
 * DinoConfig SDK instance interface.
 * Provides access to all SDK APIs through a unified interface.
 *
 * @interface DinoConfigInstance
 * @property {ConfigAPI} configs - API for retrieving configuration values
 * @property {DiscoveryAPI} discovery - API for discovering brands, configs, and schemas
 *
 * @example
 * ```typescript
 * const dinoconfig = await dinoconfigApi({ apiKey: 'dino_...' });
 *
 * // Get entire config
 * const config = await dinoconfig.configs.get('Brand.Config');
 *
 * // Get single value
 * const value = await dinoconfig.configs.getValue('Brand.Config.Key');
 *
 * // Discovery
 * const brands = await dinoconfig.discovery.listBrands();
 * ```
 */
export interface DinoConfigInstance {
  /**
   * Configuration API for retrieving config values.
   *
   * Methods:
   * - `get(path)` or `get(brand, config)` - Get entire config
   * - `getValue(path)` or `getValue(brand, config, key)` - Get single value
   *
   * @see {@link ConfigAPI}
   */
  configs: ConfigAPI;

  /**
   * Discovery API for exploring available brands, configs, and schemas.
   *
   * Methods:
   * - `listBrands()` - List all accessible brands
   * - `listConfigs(brand)` - List configs for a brand
   * - `getSchema(brand, config)` - Get config schema
   * - `introspect()` - Full introspection of all data
   *
   * @see {@link DiscoveryAPI}
   */
  discovery: DiscoveryAPI;
}

/**
 * Creates and initializes a new DinoConfig SDK instance.
 *
 * This is the main entry point for using the DinoConfig SDK.
 *
 * @async
 * @function dinoconfigApi
 * @param {DinoConfigSDKConfig} config - Configuration options
 * @param {string} config.apiKey - Your DinoConfig API key
 * @param {string} [config.baseUrl='http://localhost:3000'] - API base URL
 * @param {number} [config.timeout=10000] - Request timeout in milliseconds
 * @returns {Promise<DinoConfigInstance>} Initialized SDK instance
 * @throws {Error} If API key exchange fails or network error occurs
 *
 * @example Basic usage
 * ```typescript
 * import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';
 *
 * const dinoconfig = await dinoconfigApi({
 *   apiKey: 'dino_your-api-key-here'
 * });
 *
 * // Get config value
 * const response = await dinoconfig.configs.getValue('Brand.Config.Key');
 * console.log(response.data);
 * ```
 *
 * @example With all options
 * ```typescript
 * const dinoconfig = await dinoconfigApi({
 *   apiKey: process.env.DINOCONFIG_API_KEY!,
 *   baseUrl: 'https://api.dinoconfig.com',
 *   timeout: 15000
 * });
 * ```
 *
 * @example Error handling
 * ```typescript
 * try {
 *   const dinoconfig = await dinoconfigApi({ apiKey: '...' });
 * } catch (error) {
 *   console.error('Failed to initialize:', error);
 * }
 * ```
 */
export async function dinoconfigApi(config: DinoConfigSDKConfig): Promise<DinoConfigInstance> {
  const {
    apiKey,
    baseUrl = 'http://localhost:3000',
    timeout = 10000,
  } = config;

  // Create HTTP client with base configuration
  const httpClient = new HttpClient(baseUrl, timeout);

  // Exchange API key for access token and configure authorization
  await httpClient.configureAuthorizationHeader({
    'X-API-Key': apiKey,
  });

  // Return initialized SDK instance with all APIs
  return {
    configs: new ConfigAPI(httpClient),
    discovery: new DiscoveryAPI(httpClient),
  };
}
