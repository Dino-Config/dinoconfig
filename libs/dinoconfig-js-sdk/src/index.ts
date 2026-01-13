/**
 * DinoConfig JavaScript SDK
 *
 * Official SDK for interacting with the DinoConfig API.
 * Provides a simple, type-safe way to retrieve configuration values.
 *
 * @packageDocumentation
 * @module @dinoconfig/dinoconfig-js-sdk
 * @version 1.0.0
 * @license MIT
 *
 * @example Quick Start
 * ```typescript
 * import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';
 *
 * // Initialize the SDK
 * const dinoconfig = await dinoconfigApi({
 *   apiKey: 'dino_your-api-key-here',
 *   baseUrl: 'https://api.dinoconfig.com'
 * });
 *
 * // Get entire config
 * const config = await dinoconfig.configs.get('MyBrand.AppSettings');
 * console.log('All values:', config.data.values);
 *
 * // Get single value (shorthand)
 * const theme = await dinoconfig.configs.getValue('MyBrand.AppSettings.theme');
 * console.log('Theme:', theme.data);
 *
 * // Get single value (full params)
 * const response = await dinoconfig.configs.getValue('MyBrand', 'AppSettings', 'theme');
 * console.log('Theme:', response.data);
 * ```
 *
 * @example Discovery API
 * ```typescript
 * // List all brands
 * const brands = await dinoconfig.discovery.listBrands();
 *
 * // List configs for a brand
 * const configs = await dinoconfig.discovery.listConfigs('MyBrand');
 *
 * // Get config schema
 * const schema = await dinoconfig.discovery.getSchema('MyBrand', 'FeatureFlags');
 *
 * // Full introspection
 * const all = await dinoconfig.discovery.introspect();
 * ```
 *
 * @see {@link https://docs.dinoconfig.com | Documentation}
 * @see {@link https://github.com/dinoconfig/dinoconfig-js-sdk | GitHub}
 */

// ─────────────────────────────────────────────────────────────────────────────
// Main SDK
// ─────────────────────────────────────────────────────────────────────────────

/** Factory function to create SDK instance */
export { dinoconfigApi } from './lib/dinoconfig-js-sdk';

/** SDK instance type */
export type { DinoConfigInstance, CacheAPI } from './lib/dinoconfig-js-sdk';

/** SDK configuration options */
export type { DinoConfigSDKConfig, ApiResponse, RequestOptions } from './lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// Configs API
// ─────────────────────────────────────────────────────────────────────────────

/** Configuration API class */
export { ConfigAPI } from './lib/config-api';

/** Full configuration data returned by configs.get() */
export type { ConfigData } from './lib/config-api';

// ─────────────────────────────────────────────────────────────────────────────
// Discovery API
// ─────────────────────────────────────────────────────────────────────────────

/** Discovery API class */
export { DiscoveryAPI } from './lib/discovery-api';

/** Discovery API types */
export type {
  /** Brand information from listBrands() */
  BrandInfo,
  /** Config information from listConfigs() */
  ConfigInfo,
  /** Config schema from getSchema() */
  ConfigSchema,
  /** Field schema definition */
  FieldSchema,
  /** Supported field types */
  FieldType,
  /** Field validation rules */
  FieldValidation,
  /** Full introspection result */
  IntrospectionResult,
  /** Brand with detailed config info (for introspection) */
  BrandInfoDetail,
  /** Config with key details (for introspection) */
  ConfigInfoDetail,
  /** Key information with name, type, and value */
  KeyInfo,
} from './lib/discovery-api';

// ─────────────────────────────────────────────────────────────────────────────
// Cache API
// ─────────────────────────────────────────────────────────────────────────────

/** Cache API types */
export type { CacheConfig, CacheEntry, CacheOptions, CacheStats } from './lib/cache';
