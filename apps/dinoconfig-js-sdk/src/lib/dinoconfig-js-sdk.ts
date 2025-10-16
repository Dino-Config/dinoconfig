import { HttpClient } from './http-client';
import { ConfigAPI } from './config-api';
import { DinoConfigSDKConfig, ApiResponse, RequestOptions } from './types';

export class DinoConfigSDK {
  private httpClient!: HttpClient;

  async configure(config: DinoConfigSDKConfig): Promise<void> {
    const {
      apiKey,
      baseUrl = 'http://localhost:3000',
      timeout = 10000,
    } = config;

    this.httpClient = new HttpClient(baseUrl, timeout);

    await this.httpClient.configureAuthorizationHeader({
      'X-API-Key': apiKey,
    });
  }

  getConfigAPI(): ConfigAPI {
    let configAPI = null;

    if (!configAPI) {
      configAPI = new ConfigAPI(this.httpClient);
    }

    return configAPI;
  }
}

/**
 * Create and configure a new DinoConfig SDK instance
 * 
 * The SDK will automatically exchange your API key for an access token
 * and handle token refresh automatically.
 * 
 * @example
 * ```typescript
 * const dinoconfig = dinoconfigApi({
 *   apiKey: 'dino_your-api-key-here',
 *   baseUrl: 'https://api.dinoconfig.com',
 *   apiVersion: 'v1',
 *   timeout: 10000
 * });
 * 
 * // The SDK is ready to use immediately
 * // Token exchange happens automatically in the background
 * const configs = await dinoconfig.configs.getAllConfigs(123);
 * 
 * // Get a specific config
 * const config = await dinoconfig.configs.getConfig(123, 456);
 * ```
 */
