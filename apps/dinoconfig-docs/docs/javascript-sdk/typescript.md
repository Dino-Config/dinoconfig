---
sidebar_position: 6
title: TypeScript Integration
description: Generate fully type-safe configuration access with the DinoConfig CLI and TypeScript. Create typed interfaces for your configs.
keywords: [typescript, type safety, code generation, cli, typed configs, generics]
---

# TypeScript Integration

The DinoConfig JavaScript SDK is built with TypeScript and provides full type safety. For even better developer experience, you can generate TypeScript types from your configuration schemas.

## Built-in Type Safety

The SDK uses TypeScript generics throughout:

```typescript
import { dinoconfigApi, ApiResponse, ConfigData } from '@dinoconfig/dinoconfig-js-sdk';

// Generic type parameters
const config = await dinoconfig.configs.get<MyConfigType>('Brand.Config');
const value = await dinoconfig.configs.getValue<string>('Brand.Config.Key');
```

## Manual Type Definitions

Define interfaces for your configurations:

```typescript
// types/configs.ts
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  maxItems: number;
  features: string[];
  apiEndpoint: string;
}

export interface FeatureFlags {
  darkMode: boolean;
  newDashboard: boolean;
  betaFeatures: {
    enabled: boolean;
    allowedUsers: string[];
  };
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  poolSize: number;
  ssl: boolean;
}
```

Use them with the SDK:

```typescript
import { AppSettings, FeatureFlags } from './types/configs';

// Full type safety
const settings = await dinoconfig.configs.get<AppSettings>('MyApp.Settings');
console.log(settings.data.values.theme); // TypeScript knows this is 'light' | 'dark' | 'system'

const flags = await dinoconfig.configs.get<FeatureFlags>('MyApp.FeatureFlags');
if (flags.data.values.darkMode) {
  // ...
}
```

## Generated Types with CLI

For the best experience, use the **[DinoConfig CLI](../cli/getting-started)** to generate TypeScript types from your configuration schemas. The CLI creates namespace-based type definitions that match your brand and config structure.

See the [DinoConfig CLI documentation](../cli/getting-started#codegen--generate-typescript-types) for installation, the `codegen` command, and CI/CD integration.

### Using Generated Types with the SDK

```typescript
import { DinoConfig } from './types/dinoconfig';

// Full IntelliSense and type checking
const settings = await dinoconfig.configs.get<DinoConfig.MyApp.Settings>(
  'MyApp.Settings'
);

// TypeScript knows all properties
const { theme, maxItems, features } = settings.data.values;

// Error: Property 'invalidKey' does not exist
settings.data.values.invalidKey; // ❌ Type error
```

## Type-Safe Wrapper

Create a type-safe wrapper around the SDK:

```typescript title="src/config/client.ts"
import { dinoconfigApi, DinoConfigInstance } from '@dinoconfig/dinoconfig-js-sdk';
import { DinoConfig } from './types/dinoconfig';

class TypedConfigClient {
  private sdk: DinoConfigInstance;

  constructor(sdk: DinoConfigInstance) {
    this.sdk = sdk;
  }

  // Type-safe methods for each configuration
  async getAppSettings() {
    return this.sdk.configs.get<DinoConfig.MyApp.Settings>('MyApp.Settings');
  }

  async getFeatureFlags() {
    return this.sdk.configs.get<DinoConfig.MyApp.FeatureFlags>('MyApp.FeatureFlags');
  }

  async getDatabaseConfig() {
    return this.sdk.configs.get<DinoConfig.MyApp.Database>('MyApp.Database');
  }

  // Type-safe value getters
  async getTheme() {
    return this.sdk.configs.getValue<DinoConfig.MyApp.Settings['theme']>(
      'MyApp.Settings.theme'
    );
  }

  async isDarkModeEnabled() {
    return this.sdk.configs.getValue<boolean>('MyApp.FeatureFlags.darkMode');
  }
}

// Create and export the client
let client: TypedConfigClient;

export async function getConfigClient() {
  if (!client) {
    const sdk = await dinoconfigApi({
      apiKey: process.env.DINOCONFIG_API_KEY!,
    });
    client = new TypedConfigClient(sdk);
  }
  return client;
}
```

Usage:

```typescript
import { getConfigClient } from './config/client';

async function main() {
  const config = await getConfigClient();

  // Fully typed responses
  const settings = await config.getAppSettings();
  console.log(settings.data.values.theme); // 'light' | 'dark' | 'system'

  const isDark = await config.isDarkModeEnabled();
  console.log(isDark.data); // boolean
}
```

## Exported Types

The SDK exports all necessary types:

```typescript
import {
  // SDK types
  DinoConfigInstance,
  DinoConfigSDKConfig,
  ApiResponse,
  RequestOptions,
  
  // Config types
  ConfigAPI,
  ConfigData,
  
  // Discovery types
  DiscoveryAPI,
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
  
  // Cache types
  CacheAPI,
  CacheConfig,
  CacheEntry,
  CacheOptions,
  CacheStats,
  
  // Error types
  ApiError,
} from '@dinoconfig/dinoconfig-js-sdk';
```

## Type Utilities

### Extracting Config Value Types

```typescript
import { ConfigData } from '@dinoconfig/dinoconfig-js-sdk';

// Extract the values type from ConfigData
type ConfigValues<T> = T extends ConfigData<infer V> ? V : never;

// Usage
type SettingsValues = ConfigValues<ConfigData<AppSettings>>;
// Result: AppSettings
```

### Response Type Helper

```typescript
import { ApiResponse } from '@dinoconfig/dinoconfig-js-sdk';

// Helper to extract data type
type ResponseData<T> = T extends ApiResponse<infer D> ? D : never;

// Usage
type SettingsResponse = Awaited<ReturnType<typeof dinoconfig.configs.get<AppSettings>>>;
type SettingsData = ResponseData<SettingsResponse>;
// Result: ConfigData<AppSettings>
```

## Best Practices

### 1. Always Use Generics

```typescript
// ✅ Type-safe
const config = await dinoconfig.configs.get<AppSettings>('Brand.Config');
const value = await dinoconfig.configs.getValue<string>('Brand.Config.Key');

// ❌ Untyped (data is unknown)
const config = await dinoconfig.configs.get('Brand.Config');
const value = await dinoconfig.configs.getValue('Brand.Config.Key');
```

### 2. Validate Response Success

```typescript
const response = await dinoconfig.configs.get<AppSettings>('Brand.Config');

if (response.success) {
  // TypeScript knows response.data is ConfigData<AppSettings>
  const { theme } = response.data.values;
}
```

### 3. Use Strict TypeScript Settings

```json title="tsconfig.json"
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 4. Regenerate Types on Schema Changes

Add type generation to your CI/CD pipeline. See the [DinoConfig CLI documentation](../cli/getting-started#cicd-integration) for complete examples.

## IDE Support

With proper types, you get full IDE support:

- **IntelliSense** — Autocomplete for configuration keys
- **Type checking** — Catch errors at compile time
- **Refactoring** — Safe renaming and refactoring
- **Documentation** — JSDoc comments in generated types

## Next Steps

- **[DinoConfig CLI →](../cli/getting-started)** — Generate TypeScript types from your schemas
- **[Examples →](examples)** — Real-world usage patterns
