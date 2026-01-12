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
 * // Get a configuration value
 * const response = await dinoconfig.configs.getConfigValue(
 *   'MyBrand',
 *   'AppSettings',
 *   'theme'
 * );
 * 
 * console.log('Theme:', response.data);
 * ```
 * 
 * @see {@link https://docs.dinoconfig.com | Documentation}
 * @see {@link https://github.com/dinoconfig/dinoconfig-js-sdk | GitHub}
 */

// Main SDK factory function
export { dinoconfigApi } from './lib/dinoconfig-js-sdk';

// Type exports
export type { DinoConfigInstance } from './lib/dinoconfig-js-sdk';
export type { DinoConfigSDKConfig, ApiResponse, RequestOptions } from './lib/types';

// Class exports (for advanced usage)
export { ConfigAPI } from './lib/config-api';
export { DiscoveryAPI } from './lib/discovery-api';
export type {
  BrandInfo,
  ConfigInfo,
  ConfigSchema,
  FieldSchema,
  FieldType,
  FieldValidation,
  IntrospectionResult,
  BrandInfoDetail,
  ConfigInfoDetail,
  KeyInfo,
} from './lib/discovery-api';
