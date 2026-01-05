import { HttpClient } from './http-client';
import { ConfigAPI } from './config-api';
import { DinoConfigSDKConfig } from './types';

/**
 * DinoConfig SDK instance interface
 * Provides access to all SDK APIs
 */
export interface DinoConfigInstance {
  /** Configuration API for managing config values */
  configs: ConfigAPI;
}

/**
 * Create and configure a new DinoConfig SDK instance
 * 
 * The SDK will automatically exchange your API key for an access token
 * and handle token refresh automatically.
 * 
 * @example
 * ```typescript
 * const dinoconfig = await dinoconfigApi({
 *   apiKey: 'dino_your-api-key-here',
 *   baseUrl: 'https://api.dinoconfig.com',
 *   timeout: 10000
 * });
 * 
 * // Get a config value
 * const response = await dinoconfig.configs.getConfigValue('brandName', 'configName', 'key');
 * if (response.success) {
 *   console.log('Config value:', response.data);
 * }
 * ```
 */
export async function dinoconfigApi(config: DinoConfigSDKConfig): Promise<DinoConfigInstance> {
  const {
    apiKey,
    baseUrl = 'http://localhost:3000',
    timeout = 10000,
  } = config;

  const httpClient = new HttpClient(baseUrl, timeout);

  await httpClient.configureAuthorizationHeader({
    'X-API-Key': apiKey,
  });

  return {
    configs: new ConfigAPI(httpClient),
  };
}
