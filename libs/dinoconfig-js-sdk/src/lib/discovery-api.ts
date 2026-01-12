/**
 * @fileoverview Discovery API for the DinoConfig SDK.
 * Provides methods for discovering available brands, configs, and schemas.
 * @module @dinoconfig/dinoconfig-js-sdk/discovery-api
 * @version 1.0.0
 */

import { HttpClient } from './http-client';
import { ApiResponse, RequestOptions } from './types';

/**
 * Information about a brand in DinoConfig.
 */
export interface BrandInfo {
  readonly name: string;
  readonly description?: string;
  readonly configCount: number;
  readonly createdAt: Date;
}

/**
 * Information about a configuration in DinoConfig.
 */
export interface ConfigInfo {
  readonly name: string;
  readonly description?: string;
  readonly keys: readonly string[];
  readonly version: number;
  readonly createdAt: Date;
}

/** Supported field types in DinoConfig schemas */
export type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array';

/**
 * Validation rules for a configuration field.
 */
export interface FieldValidation {
  readonly min?: number;
  readonly max?: number;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
  readonly enum?: readonly unknown[];
}

/**
 * Schema definition for a configuration field.
 */
export interface FieldSchema {
  readonly type: FieldType;
  readonly description?: string;
  readonly defaultValue?: unknown;
  readonly required?: boolean;
  readonly validation?: FieldValidation;
}

/**
 * Complete schema for a configuration.
 */
export interface ConfigSchema {
  readonly configName: string;
  readonly version: number;
  readonly fields: Readonly<Record<string, FieldSchema>>;
}

/**
 * Key information with type and value.
 */
export interface KeyInfo {
  readonly name: string;
  readonly type: string;
  readonly value: unknown;
}

/**
 * Configuration information with key details.
 */
export interface ConfigInfoDetail {
  readonly name: string;
  readonly description?: string;
  readonly keys: readonly KeyInfo[];
  readonly version: number;
}

/**
 * Brand information with config details.
 */
export interface BrandInfoDetail {
  readonly name: string;
  readonly description?: string;
  readonly configs: readonly ConfigInfoDetail[];
}

/**
 * Full introspection result containing all brands, configs, and keys.
 */
export interface IntrospectionResult {
  readonly company: string;
  readonly brands: readonly BrandInfoDetail[];
  readonly generatedAt: Date;
}

/**
 * Discovery API class for interacting with DinoConfig discovery endpoints.
 * 
 * This class provides methods to discover available brands, configurations,
 * and their schemas, enabling dynamic configuration discovery.
 * 
 * @class DiscoveryAPI
 * @example
 * ```typescript
 * const dinoconfig = await dinoconfigApi({ apiKey: 'dino_...' });
 * 
 * // List all brands
 * const brands = await dinoconfig.discovery.listBrands();
 * console.log('Available brands:', brands.data);
 * 
 * // List configs for a brand
 * const configs = await dinoconfig.discovery.listConfigs('MyBrand');
 * console.log('Configs:', configs.data);
 * 
 * // Get config schema
 * const schema = await dinoconfig.discovery.getSchema('MyBrand', 'FeatureFlags');
 * console.log('Schema:', schema.data);
 * ```
 */
export class DiscoveryAPI {
  /**
   * Creates a new DiscoveryAPI instance.
   * 
   * @param {HttpClient} httpClient - The HTTP client for making API requests
   * @internal This constructor is called internally by the SDK
   */
  constructor(private httpClient: HttpClient) {}

  /**
   * Lists all brands accessible by the current API key.
   * 
   * @async
   * @method listBrands
   * @param {RequestOptions} [options] - Optional request configuration
   * @returns {Promise<ApiResponse<BrandInfo[]>>} A Promise resolving to the list of brands
   * @throws {ApiError} If the request fails
   * 
   * @example
   * ```typescript
   * const response = await dinoconfig.discovery.listBrands();
   * if (response.success) {
   *   response.data.forEach(brand => {
   *     console.log(`${brand.name}: ${brand.configCount} configs`);
   *   });
   * }
   * ```
   */
  async listBrands(options?: RequestOptions): Promise<ApiResponse<BrandInfo[]>> {
    const response = await this.httpClient.get<{ brands: BrandInfo[]; total: number }>(
      '/api/sdk/brands',
      options
    );
    return {
      ...response,
      data: response.data.brands,
    };
  }

  /**
   * Lists all configurations for a specific brand.
   * 
   * @async
   * @method listConfigs
   * @param {string} brandName - The name of the brand
   * @param {RequestOptions} [options] - Optional request configuration
   * @returns {Promise<ApiResponse<ConfigInfo[]>>} A Promise resolving to the list of configs
   * @throws {ApiError} If the request fails
   * 
   * @example
   * ```typescript
   * const response = await dinoconfig.discovery.listConfigs('MyBrand');
   * if (response.success) {
   *   response.data.forEach(config => {
   *     console.log(`${config.name}: ${config.keyCount} keys`);
   *   });
   * }
   * ```
   */
  async listConfigs(brandName: string, options?: RequestOptions): Promise<ApiResponse<ConfigInfo[]>> {
    const response = await this.httpClient.get<{ configs: ConfigInfo[]; total: number }>(
      `/api/sdk/brands/${encodeURIComponent(brandName)}/configs`,
      options
    );
    return {
      ...response,
      data: response.data.configs,
    };
  }

  /**
   * Gets the schema/structure for a specific configuration.
   * 
   * @async
   * @method getSchema
   * @param {string} brandName - The name of the brand
   * @param {string} configName - The name of the configuration
   * @param {RequestOptions} [options] - Optional request configuration
   * @returns {Promise<ApiResponse<ConfigSchema>>} A Promise resolving to the config schema
   * @throws {ApiError} If the request fails
   * 
   * @example
   * ```typescript
   * const response = await dinoconfig.discovery.getSchema('MyBrand', 'FeatureFlags');
   * if (response.success) {
   *   const schema = response.data;
   *   console.log('Fields:', Object.keys(schema.fields));
   *   console.log('Types:', Object.values(schema.fields).map(f => f.type));
   * }
   * ```
   */
  async getSchema(
    brandName: string,
    configName: string,
    options?: RequestOptions
  ): Promise<ApiResponse<ConfigSchema>> {
    return this.httpClient.get<ConfigSchema>(
      `/api/sdk/brands/${encodeURIComponent(brandName)}/configs/${encodeURIComponent(configName)}/schema`,
      options
    );
  }

  /**
   * Performs full introspection, returning all brands, configs, and keys.
   * 
   * This method provides a complete view of all accessible configurations,
   * including current values for each key. Useful for discovery and documentation.
   * 
   * @async
   * @method introspect
   * @param {RequestOptions} [options] - Optional request configuration
   * @returns {Promise<ApiResponse<IntrospectionResult>>} A Promise resolving to the full introspection result
   * @throws {ApiError} If the request fails
   * 
   * @example
   * ```typescript
   * const response = await dinoconfig.discovery.introspect();
   * if (response.success) {
   *   response.data.brands.forEach(brand => {
   *     console.log(`Brand: ${brand.name}`);
   *     brand.configs.forEach(config => {
   *       console.log(`  Config: ${config.name}`);
   *       config.keys.forEach(key => {
   *         console.log(`    ${key.name} (${key.type}): ${key.value}`);
   *       });
   *     });
   *   });
   * }
   * ```
   */
  async introspect(options?: RequestOptions): Promise<ApiResponse<IntrospectionResult>> {
    return this.httpClient.get<IntrospectionResult>('/api/sdk/introspect', options);
  }
}
