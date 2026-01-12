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
 * @example
 * ```typescript
 * const dinoconfig: DinoConfigInstance = await dinoconfigApi({
 *   apiKey: 'dino_your-api-key'
 * });
 * 
 * // Access the configs API
 * const response = await dinoconfig.configs.getConfigValue('brand', 'config', 'key');
 * ```
 */
export interface DinoConfigInstance {
  /**
   * Configuration API for retrieving config values.
   * Provides methods to interact with DinoConfig configurations.
   * 
   * @see {@link ConfigAPI}
   */
  configs: ConfigAPI;

  /**
   * Discovery API for discovering available brands, configs, and schemas.
   * Provides methods to list and introspect configurations.
   * 
   * @see {@link DiscoveryAPI}
   */
  discovery: DiscoveryAPI;
}

/**
 * Creates and initializes a new DinoConfig SDK instance.
 * 
 * This is the main entry point for using the DinoConfig SDK. It follows
 * the factory function pattern (similar to Shopify's SDK) for a cleaner,
 * more intuitive initialization experience.
 * 
 * @async
 * @function dinoconfigApi
 * @param {DinoConfigSDKConfig} config - Configuration options for the SDK
 * @returns {Promise<DinoConfigInstance>} A Promise that resolves to an initialized SDK instance
 * @throws {Error} If API key exchange fails or network error occurs
 * 
 * @remarks
 * The SDK automatically:
 * - Exchanges your API key for an access token
 * - Configures authorization headers
 * - Sets up the HTTP client with your preferences
 * 
 * @example Basic usage
 * ```typescript
 * import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';
 * 
 * const dinoconfig = await dinoconfigApi({
 *   apiKey: 'dino_your-api-key-here'
 * });
 * 
 * // SDK is ready to use!
 * const response = await dinoconfig.configs.getConfigValue('brand', 'config', 'key');
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
 *   const dinoconfig = await dinoconfigApi({
 *     apiKey: 'dino_invalid-key'
 *   });
 * } catch (error) {
 *   console.error('Failed to initialize SDK:', error.message);
 *   // Handle initialization failure
 * }
 * ```
 * 
 * @example Express.js integration
 * ```typescript
 * import express from 'express';
 * import { dinoconfigApi, DinoConfigInstance } from '@dinoconfig/dinoconfig-js-sdk';
 * 
 * let dinoconfig: DinoConfigInstance;
 * 
 * async function initApp() {
 *   dinoconfig = await dinoconfigApi({
 *     apiKey: process.env.DINOCONFIG_API_KEY!
 *   });
 *   
 *   const app = express();
 *   app.get('/config/:key', async (req, res) => {
 *     const response = await dinoconfig.configs.getConfigValue(
 *       'MyBrand', 'Settings', req.params.key
 *     );
 *     res.json(response.data);
 *   });
 *   app.listen(3000);
 * }
 * 
 * initApp();
 * ```
 * 
 * @see {@link DinoConfigSDKConfig} for configuration options
 * @see {@link DinoConfigInstance} for available APIs
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
