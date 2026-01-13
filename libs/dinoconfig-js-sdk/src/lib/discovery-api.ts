/**
 * @fileoverview Discovery API for the DinoConfig SDK.
 * Provides methods for discovering available brands, configs, and schemas.
 * @module @dinoconfig/dinoconfig-js-sdk/discovery-api
 * @version 1.0.0
 */

import { HttpClient } from './http-client';
import { ApiResponse, RequestOptions } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Base path for SDK discovery endpoints */
const API_BASE_PATH = '/api/sdk';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Internal response types
// ─────────────────────────────────────────────────────────────────────────────

interface BrandListResponse {
  brands: BrandInfo[];
  total: number;
}

interface ConfigListResponse {
  configs: ConfigInfo[];
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Discovery API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Discovery API class for interacting with DinoConfig discovery endpoints.
 *
 * @class DiscoveryAPI
 * @example
 * ```typescript
 * const dinoconfig = await dinoconfigApi({ apiKey: 'dino_...' });
 *
 * // List all brands
 * const brands = await dinoconfig.discovery.listBrands();
 *
 * // List configs for a brand
 * const configs = await dinoconfig.discovery.listConfigs('MyBrand');
 *
 * // Get config schema
 * const schema = await dinoconfig.discovery.getSchema('MyBrand', 'FeatureFlags');
 * ```
 */
export class DiscoveryAPI {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Lists all brands accessible by the current API key.
   *
   * @example
   * ```typescript
   * const response = await dinoconfig.discovery.listBrands();
   * response.data.forEach(brand => {
   *   console.log(`${brand.name}: ${brand.configCount} configs`);
   * });
   * ```
   */
  async listBrands(options?: RequestOptions): Promise<ApiResponse<BrandInfo[]>> {
    const response = await this.httpClient.get<BrandListResponse>(
      `${API_BASE_PATH}/brands`,
      options
    );
    return this.extractData(response, response.data.brands);
  }

  /**
   * Lists all configurations for a specific brand.
   *
   * @example
   * ```typescript
   * const response = await dinoconfig.discovery.listConfigs('MyBrand');
   * response.data.forEach(config => {
   *   console.log(`${config.name}: ${config.keys.length} keys`);
   * });
   * ```
   */
  async listConfigs(brandName: string, options?: RequestOptions): Promise<ApiResponse<ConfigInfo[]>> {
    const response = await this.httpClient.get<ConfigListResponse>(
      this.buildBrandUrl(brandName, '/configs'),
      options
    );
    return this.extractData(response, response.data.configs);
  }

  /**
   * Gets the schema/structure for a specific configuration.
   *
   * @example
   * ```typescript
   * const response = await dinoconfig.discovery.getSchema('MyBrand', 'FeatureFlags');
   * Object.entries(response.data.fields).forEach(([name, field]) => {
   *   console.log(`${name}: ${field.type}`);
   * });
   * ```
   */
  async getSchema(
    brandName: string,
    configName: string,
    options?: RequestOptions
  ): Promise<ApiResponse<ConfigSchema>> {
    return this.httpClient.get<ConfigSchema>(
      this.buildConfigUrl(brandName, configName, '/schema'),
      options
    );
  }

  /**
   * Performs full introspection, returning all brands, configs, and keys.
   *
   * @example
   * ```typescript
   * const response = await dinoconfig.discovery.introspect();
   * response.data.brands.forEach(brand => {
   *   console.log(`Brand: ${brand.name}`);
   *   brand.configs.forEach(config => {
   *     console.log(`  Config: ${config.name} (${config.keys.length} keys)`);
   *   });
   * });
   * ```
   */
  async introspect(options?: RequestOptions): Promise<ApiResponse<IntrospectionResult>> {
    return this.httpClient.get<IntrospectionResult>(`${API_BASE_PATH}/introspect`, options);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Builds URL path for brand-level endpoints.
   */
  private buildBrandUrl(brandName: string, suffix = ''): string {
    return `${API_BASE_PATH}/brands/${this.encode(brandName)}${suffix}`;
  }

  /**
   * Builds URL path for config-level endpoints.
   */
  private buildConfigUrl(brandName: string, configName: string, suffix = ''): string {
    return `${API_BASE_PATH}/brands/${this.encode(brandName)}/configs/${this.encode(configName)}${suffix}`;
  }

  /**
   * URL-encodes a path segment.
   */
  private encode(value: string): string {
    return encodeURIComponent(value);
  }

  /**
   * Extracts and transforms response data.
   */
  private extractData<TOriginal, TExtracted>(
    response: ApiResponse<TOriginal>,
    extracted: TExtracted
  ): ApiResponse<TExtracted> {
    return {
      ...response,
      data: extracted,
    };
  }
}
