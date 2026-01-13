/**
 * DTOs for SDK Discovery API responses.
 * These DTOs define the response structure for discovery endpoints.
 */

/** Supported field types in config schemas */
export type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array';

/**
 * Summary information about a brand.
 */
export class BrandSummaryDto {
  name: string;
  description?: string;
  configCount: number;
  createdAt: Date;
}

/**
 * Response containing a list of brands.
 */
export class BrandListResponseDto {
  brands: BrandSummaryDto[];
  total: number;
}

/**
 * Summary information about a configuration.
 */
export class ConfigSummaryDto {
  name: string;
  description?: string;
  keys: string[];
  keyCount: number;
  version: number;
  createdAt: Date;
}

/**
 * Response containing a list of configurations.
 */
export class ConfigListResponseDto {
  configs: ConfigSummaryDto[];
  total: number;
}

/**
 * Detailed configuration information including all values.
 */
export class ConfigDetailResponseDto {
  name: string;
  description?: string;
  formData: Record<string, unknown>;
  version: number;
  keys: string[];
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Validation rules for a schema field.
 */
export interface FieldValidationDto {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: unknown[];
}

/**
 * Schema definition for a configuration field.
 */
export class FieldSchemaDto {
  type: FieldType;
  description?: string;
  defaultValue?: unknown;
  required?: boolean;
  validation?: FieldValidationDto;
}

/**
 * Response containing the schema for a configuration.
 */
export class ConfigSchemaResponseDto {
  configName: string;
  version: number;
  fields: Record<string, FieldSchemaDto>;
}

/**
 * Information about a single configuration key.
 */
export class KeyInfoDto {
  name: string;
  type: string;
  value: unknown;
}

/**
 * Configuration information with key details for introspection.
 */
export class ConfigInfoDto {
  name: string;
  description?: string;
  keys: KeyInfoDto[];
  version: number;
}

/**
 * Brand information with config details for introspection.
 */
export class BrandInfoDto {
  name: string;
  description?: string;
  configs: ConfigInfoDto[];
}

/**
 * Full introspection response containing all brands, configs, and keys.
 */
export class IntrospectionResponseDto {
  company: string;
  brands: BrandInfoDto[];
  generatedAt: Date;
}
