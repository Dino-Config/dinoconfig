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
import { CacheManager } from './cache/cache-manager';
import { CacheConfig, CacheStats } from './cache/cache.types';

/**
 * Cache API interface.
 */
export interface CacheAPI {
  /**
   * Get a value from cache.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value in cache.
   */
  set<T>(key: string, value: T, options?: { ttl?: number }): Promise<void>;

  /**
   * Delete a value from cache.
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all cache entries.
   */
  clear(): Promise<void>;

  /**
   * Invalidate entries matching a pattern.
   */
  invalidate(pattern?: string): Promise<void>;

  /**
   * Prefetch a value into cache.
   */
  prefetch<T>(key: string, fetcher: () => Promise<T>): Promise<T>;

  /**
   * Get cache statistics.
   */
  getStats(): CacheStats;
}

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
 *
 * // Cache management
 * await dinoconfig.cache.invalidate('brand:.*');
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

  /**
   * Cache API for managing the cache layer.
   * 
   * @see {@link CacheAPI}
   */
  cache: CacheAPI;
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
    cache: cacheConfig,
  } = config;

  // Create HTTP client with base configuration
  const httpClient = new HttpClient(baseUrl, timeout);

  // Exchange API key for access token and configure authorization
  await httpClient.configureAuthorizationHeader({
    'X-API-Key': apiKey,
  });

  // Initialize cache if enabled
  const cacheManager = new CacheManager({
    enabled: cacheConfig?.enabled ?? false,
    ttl: cacheConfig?.ttl ?? 60000,
    maxSize: cacheConfig?.maxSize ?? 1000,
    storage: cacheConfig?.storage,
    staleWhileRevalidate: cacheConfig?.staleWhileRevalidate ?? false,
  });

  // Return initialized SDK instance with all APIs
  return {
    configs: new ConfigAPI(httpClient, cacheManager),
    discovery: new DiscoveryAPI(httpClient),
    cache: cacheManager,
  };
}
