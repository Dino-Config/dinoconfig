import { HttpClient } from './http-client';
import { ConfigAPI } from './config-api';
import { DinoConfigSDKConfig, ApiResponse, RequestOptions } from './types';

export class DinoConfigSDK {
  private httpClient: HttpClient;
  public configs: ConfigAPI;

  constructor(config: DinoConfigSDKConfig) {
    const {
      token,
      baseUrl = 'http://localhost:3000',
      company,
      apiVersion = 'v1',
      timeout = 10000,
    } = config;

    if (!token) {
      throw new Error('Token is required for DinoConfig SDK initialization');
    }

    // Initialize HTTP client
    this.httpClient = new HttpClient(baseUrl, token, timeout, {
      'X-API-Version': apiVersion,
      'X-INTERNAL-COMPANY': company || ''
    });

    // Initialize API modules
    this.configs = new ConfigAPI(this.httpClient);
  }

  /**
   * Update the SDK token
   */
  setToken(token: string): void {
    this.httpClient.setToken(token);
  }

  /**
   * Set a custom header
   */
  setHeader(key: string, value: string): void {
    this.httpClient.setHeader(key, value);
  }

  /**
   * Remove a custom header
   */
  removeHeader(key: string): void {
    this.httpClient.removeHeader(key);
  }

  /**
   * Test the connection to the API
   */
  async testConnection(options?: RequestOptions): Promise<ApiResponse<{ status: string }>> {
    return this.httpClient.get<{ status: string }>('/healthz', options);
  }
}

/**
 * Create and configure a new DinoConfig SDK instance
 * 
 * @example
 * ```typescript
 * const dinoconfig = dinoconfigApi({
 *   token: 'your-api-token-here',
 *   baseUrl: 'https://api.dinoconfig.com',
 *   company: 'your-company-id',
 *   apiVersion: 'v1',
 *   timeout: 10000
 * });
 * 
 * // Get all configs for a brand
 * const configs = await dinoconfig.configs.getAllConfigs(123);
 * 
 * // Get a specific config
 * const config = await dinoconfig.configs.getConfig(123, 456);
 * ```
 */
export function dinoconfigApi(config: DinoConfigSDKConfig): DinoConfigSDK {
  return new DinoConfigSDK(config);
}

// Legacy export for backward compatibility
export function dinoconfigJsSdk(): string {
  return 'dinoconfig-js-sdk';
}
