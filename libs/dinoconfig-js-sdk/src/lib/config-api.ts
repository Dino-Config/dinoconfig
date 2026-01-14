/**
 * @fileoverview Configuration API for the DinoConfig SDK.
 * Provides methods for retrieving configuration values.
 * @module @dinoconfig/dinoconfig-js-sdk/config-api
 * @version 1.0.0
 */

import { HttpClient } from './http-client';
import { ApiResponse, RequestOptions } from './types';
import { CacheManager } from './cache/cache-manager';

/** Base path for SDK API endpoints */
const API_BASE_PATH = '/api/sdk/brands';

/**
 * Full configuration data returned by the API.
 * @template T - The shape of the configuration values (defaults to Record<string, unknown>)
 */
export interface ConfigData<T = Record<string, unknown>> {
  readonly name: string;
  readonly description?: string;
  readonly values: Readonly<T>;
  readonly version: number;
  readonly keys: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

/** Internal response shape from backend */
interface ConfigDetailResponse {
  name: string;
  description?: string;
  formData: Record<string, unknown>;
  version: number;
  keys: string[];
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Configuration API class for interacting with DinoConfig configurations.
 *
 * This class provides methods to retrieve configuration values from the
 * DinoConfig API. It handles request formatting, error handling, response
 * parsing, and caching automatically.
 *
 * @class ConfigAPI
 * @example
 * ```typescript
 * const dinoconfig = await dinoconfigApi({ apiKey: 'dino_...' });
 *
 * // Get entire config
 * const config = await dinoconfig.configs.get('MyBrand', 'AppSettings');
 * console.log('All values:', config.data.values);
 *
 * // Get single value (shorthand)
 * const theme = await dinoconfig.configs.getValue('MyBrand.AppSettings.theme');
 * console.log('Theme:', theme.data);
 * ```
 */
export class ConfigAPI {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly cacheManager?: CacheManager
  ) {}

  /**
   * Retrieves an entire configuration with all its values.
   *
   * @template T - The shape of the configuration values for type safety
   * @example
   * ```typescript
   * // Shorthand: get('Brand.Config')
   * const config = await dinoconfig.configs.get('Acme.AppSettings');
   *
   * // Full params: get(brand, config)
   * const config = await dinoconfig.configs.get('Acme', 'AppSettings');
   * console.log(config.data.values);
   *
   * // With generated types for full type safety
   * import { DinoConfig } from './types/dinoconfig';
   * const config = await dinoconfig.configs.get<DinoConfig.Acme.AppSettings>('Acme', 'AppSettings');
   * config.data.values.theme; // fully typed!
   * ```
   */
  get<T = Record<string, unknown>>(path: string, options?: RequestOptions): Promise<ApiResponse<ConfigData<T>>>;
  get<T = Record<string, unknown>>(brandName: string, configName: string, options?: RequestOptions): Promise<ApiResponse<ConfigData<T>>>;
  async get<T = Record<string, unknown>>(
    brandNameOrPath: string,
    configNameOrOptions?: string | RequestOptions,
    options?: RequestOptions
  ): Promise<ApiResponse<ConfigData<T>>> {
    const { brand, config, requestOptions } = this.parseConfigArgs(
      brandNameOrPath,
      configNameOrOptions,
      options
    );

    const cacheKey = `config:${brand}:${config}`;
    const useCache = this.cacheManager && requestOptions?.cache !== false && !requestOptions?.forceRefresh;

    if (useCache) {
      const cached = await this.cacheManager.get<ApiResponse<ConfigData<T>>>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const response = await this.httpClient.get<ConfigDetailResponse>(
      this.buildConfigUrl(brand, config),
      requestOptions
    );

    const transformedResponse: ApiResponse<ConfigData<T>> = {
      ...response,
      data: this.transformConfigResponse<T>(response.data),
    };

    if (useCache && response.success) {
      await this.cacheManager!.set(cacheKey, transformedResponse, { ttl: requestOptions?.ttl });
    }

    return transformedResponse;
  }

  /**
   * Retrieves a specific configuration value from DinoConfig.
   *
   * @template T - The expected type of the value for type safety
   * @example
   * ```typescript
   * // Shorthand: getValue('Brand.Config.Key')
   * const response = await dinoconfig.configs.getValue('Acme.AppSettings.theme');
   *
   * // Full params: getValue(brand, config, key)
   * const response = await dinoconfig.configs.getValue('Acme', 'AppSettings', 'theme');
   * console.log('Theme:', response.data);
   *
   * // With type parameter for type safety
   * const theme = await dinoconfig.configs.getValue<string>('Acme', 'AppSettings', 'theme');
   * const maxUsers = await dinoconfig.configs.getValue<number>('Acme', 'AppSettings', 'maxUsers');
   * ```
   */
  getValue<T = unknown>(path: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  getValue<T = unknown>(brandName: string, configName: string, keyName: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  async getValue<T = unknown>(
    brandNameOrPath: string,
    configNameOrOptions?: string | RequestOptions,
    keyName?: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const { brand, config, key, requestOptions } = this.parseValueArgs(
      brandNameOrPath,
      configNameOrOptions,
      keyName,
      options
    );

    const cacheKey = `config:${brand}:${config}:${key}`;
    const useCache = this.cacheManager && requestOptions?.cache !== false && !requestOptions?.forceRefresh;

    if (useCache) {
      const cached = await this.cacheManager.get<ApiResponse<T>>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const response = await this.httpClient.get<T>(
      this.buildValueUrl(brand, config, key),
      requestOptions
    );

    if (useCache && response.success) {
      await this.cacheManager!.set(cacheKey, response, { ttl: requestOptions?.ttl });
    }

    return response;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Parses arguments for the get() method.
   */
  private parseConfigArgs(
    brandNameOrPath: string,
    configNameOrOptions?: string | RequestOptions,
    options?: RequestOptions
  ): { brand: string; config: string; requestOptions?: RequestOptions } {
    if (typeof configNameOrOptions === 'string') {
      return {
        brand: brandNameOrPath,
        config: configNameOrOptions,
        requestOptions: options,
      };
    }

    const parsed = this.parsePath(brandNameOrPath, 2);
    return {
      brand: parsed[0],
      config: parsed[1],
      requestOptions: configNameOrOptions,
    };
  }

  /**
   * Parses arguments for the getValue() method.
   */
  private parseValueArgs(
    brandNameOrPath: string,
    configNameOrOptions?: string | RequestOptions,
    keyName?: string,
    options?: RequestOptions
  ): { brand: string; config: string; key: string; requestOptions?: RequestOptions } {
    if (typeof configNameOrOptions === 'string') {
      return {
        brand: brandNameOrPath,
        config: configNameOrOptions,
        key: keyName!,
        requestOptions: options,
      };
    }

    const parsed = this.parsePath(brandNameOrPath, 3);
    return {
      brand: parsed[0],
      config: parsed[1],
      key: parsed[2],
      requestOptions: configNameOrOptions,
    };
  }

  /**
   * Parses a dot-notation path into components.
   */
  private parsePath(path: string, expectedParts: number): string[] {
    const parts = path.split('.');
    if (parts.length !== expectedParts) {
      const expected = expectedParts === 2
        ? 'brandName.configName'
        : 'brandName.configName.keyName';
      throw new Error(`Invalid path format "${path}". Expected "${expected}"`);
    }
    return parts;
  }

  /**
   * Builds the URL for fetching an entire config.
   */
  private buildConfigUrl(brand: string, config: string): string {
    return `${API_BASE_PATH}/${this.encode(brand)}/configs/${this.encode(config)}`;
  }

  /**
   * Builds the URL for fetching a single value.
   */
  private buildValueUrl(brand: string, config: string, key: string): string {
    return `${API_BASE_PATH}/${this.encode(brand)}/configs/${this.encode(config)}/${this.encode(key)}`;
  }

  /**
   * URL-encodes a path segment.
   */
  private encode(value: string): string {
    return encodeURIComponent(value);
  }

  /**
   * Transforms the backend response to the public ConfigData shape.
   */
  private transformConfigResponse<T>(data: ConfigDetailResponse): ConfigData<T> {
    return {
      name: data.name,
      description: data.description,
      values: data.formData as T,
      version: data.version,
      keys: data.keys,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
