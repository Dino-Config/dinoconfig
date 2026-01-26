---
sidebar_position: 3
title: Configs API Reference
description: Fetch configurations and values using the DinoConfig JavaScript SDK Configs API. Learn to use get() and getValue() methods.
keywords: [configs api, get configuration, getValue, fetch config, javascript sdk api]
---

# Configs API

The Configs API is the primary interface for retrieving configuration values from DinoConfig. It provides methods to fetch entire configurations or individual values.

## Overview

Access the Configs API through your initialized SDK instance:

```typescript
const dinoconfig = await dinoconfigApi({ apiKey: '...' });
const configsApi = dinoconfig.configs;
```

## Methods

### `get()` — Fetch Entire Configuration

Retrieves a complete configuration with all its values.

#### Signatures

```typescript
// Using path notation
get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<ConfigData<T>>>

// Using separate parameters
get<T>(brandName: string, configName: string, options?: RequestOptions): Promise<ApiResponse<ConfigData<T>>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | Yes | Path in `Brand.Config` format |
| `brandName` | `string` | Yes | Brand name |
| `configName` | `string` | Yes | Configuration name |
| `options` | `RequestOptions` | No | Request customization |

#### Returns

```typescript
interface ApiResponse<ConfigData<T>> {
  data: ConfigData<T>;
  success: boolean;
  message?: string;
}

interface ConfigData<T> {
  name: string;
  description?: string;
  values: Readonly<T>;        // All key-value pairs
  version: number;
  keys: readonly string[];    // Array of key names
  createdAt: Date;
  updatedAt?: Date;
}
```

#### Examples

```typescript
// Using path notation (recommended)
const config = await dinoconfig.configs.get('MyBrand.AppSettings');

console.log(config.data.name);      // "AppSettings"
console.log(config.data.version);   // 3
console.log(config.data.values);    // { theme: "dark", maxItems: 100 }
console.log(config.data.keys);      // ["theme", "maxItems"]

// Using separate parameters
const config = await dinoconfig.configs.get('MyBrand', 'AppSettings');

// With TypeScript generics for type safety
interface AppSettings {
  theme: 'light' | 'dark';
  maxItems: number;
  features: string[];
}

const typedConfig = await dinoconfig.configs.get<AppSettings>('MyBrand.AppSettings');
console.log(typedConfig.data.values.theme); // TypeScript knows this is 'light' | 'dark'
```

---

### `getValue()` — Fetch Single Value

Retrieves a specific configuration value by key.

#### Signatures

```typescript
// Using path notation
getValue<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>>

// Using separate parameters  
getValue<T>(brandName: string, configName: string, keyName: string, options?: RequestOptions): Promise<ApiResponse<T>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | Yes | Path in `Brand.Config.Key` format |
| `brandName` | `string` | Yes | Brand name |
| `configName` | `string` | Yes | Configuration name |
| `keyName` | `string` | Yes | Key name |
| `options` | `RequestOptions` | No | Request customization |

#### Returns

```typescript
interface ApiResponse<T> {
  data: T;            // The configuration value
  success: boolean;
  message?: string;
}
```

#### Examples

```typescript
// Using path notation (recommended)
const theme = await dinoconfig.configs.getValue('MyBrand.AppSettings.theme');
console.log(theme.data); // "dark"

// Using separate parameters
const maxItems = await dinoconfig.configs.getValue('MyBrand', 'AppSettings', 'maxItems');
console.log(maxItems.data); // 100

// With TypeScript generics
const theme = await dinoconfig.configs.getValue<string>('MyBrand.AppSettings.theme');
const enabled = await dinoconfig.configs.getValue<boolean>('MyBrand.Features.darkMode');
const limit = await dinoconfig.configs.getValue<number>('MyBrand.Limits.maxUsers');

// Complex types
interface FeatureConfig {
  enabled: boolean;
  rolloutPercentage: number;
  allowedUsers: string[];
}

const feature = await dinoconfig.configs.getValue<FeatureConfig>(
  'MyBrand.Features.newDashboard'
);
console.log(feature.data.enabled);          // true
console.log(feature.data.rolloutPercentage); // 50
```

## Request Options

Both methods accept optional `RequestOptions`:

```typescript
interface RequestOptions {
  headers?: Record<string, string>;  // Custom headers
  timeout?: number;                  // Request timeout (ms)
  retries?: number;                  // Retry attempts
  cache?: boolean;                   // Use cache
  forceRefresh?: boolean;            // Bypass cache
  ttl?: number;                      // Custom TTL for this request
}
```

### Examples

```typescript
// Extended timeout for large configs
const config = await dinoconfig.configs.get('Brand.LargeConfig', {
  timeout: 30000,
});

// Retry on failure
const reliable = await dinoconfig.configs.getValue('Brand.Config.Key', {
  retries: 3,
});

// Force fresh data (bypass cache)
const fresh = await dinoconfig.configs.get('Brand.Config', {
  forceRefresh: true,
});

// Disable caching for sensitive data
const sensitive = await dinoconfig.configs.getValue('Brand.Secrets.apiKey', {
  cache: false,
});

// Custom TTL for frequently changing data
const dynamic = await dinoconfig.configs.getValue('Brand.Config.counter', {
  ttl: 5000, // 5 seconds
});
```

## Path Notation

The SDK supports a convenient dot-notation syntax:

| Format | Description | Example |
|--------|-------------|---------|
| `Brand.Config` | Full configuration | `MyApp.Settings` |
| `Brand.Config.Key` | Single value | `MyApp.Settings.theme` |

```typescript
// These are equivalent:
await dinoconfig.configs.get('MyBrand.AppSettings');
await dinoconfig.configs.get('MyBrand', 'AppSettings');

// These are equivalent:
await dinoconfig.configs.getValue('MyBrand.AppSettings.theme');
await dinoconfig.configs.getValue('MyBrand', 'AppSettings', 'theme');
```

## Error Handling

```typescript
import { ApiError } from '@dinoconfig/dinoconfig-js-sdk';

try {
  const config = await dinoconfig.configs.get('Brand.NonExistent');
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 404:
        console.error('Configuration not found');
        break;
      case 401:
        console.error('Invalid API key');
        break;
      case 403:
        console.error('Access denied to this configuration');
        break;
      default:
        console.error('API error:', error.message);
    }
  }
}
```

## Best Practices

### 1. Use Path Notation

Path notation is more concise and readable:

```typescript
// ✅ Preferred
await dinoconfig.configs.getValue('Brand.Config.Key');

// ❌ More verbose
await dinoconfig.configs.getValue('Brand', 'Config', 'Key');
```

### 2. Use TypeScript Generics

Always specify types for better IDE support:

```typescript
// ✅ Type-safe
const count = await dinoconfig.configs.getValue<number>('Brand.Config.count');

// ❌ Returns unknown
const count = await dinoconfig.configs.getValue('Brand.Config.count');
```

### 3. Check Response Success

Always verify the response:

```typescript
const response = await dinoconfig.configs.getValue('Brand.Config.Key');

if (response.success) {
  // Safe to use response.data
  console.log(response.data);
} else {
  console.error('Failed:', response.message);
}
```

### 4. Batch Related Requests

Fetch entire configs when you need multiple values:

```typescript
// ✅ Single request for multiple values
const config = await dinoconfig.configs.get('Brand.Settings');
const { theme, maxItems, features } = config.data.values;

// ❌ Multiple requests (slower)
const theme = await dinoconfig.configs.getValue('Brand.Settings.theme');
const maxItems = await dinoconfig.configs.getValue('Brand.Settings.maxItems');
const features = await dinoconfig.configs.getValue('Brand.Settings.features');
```

## Next Steps

- **[Discovery API →](discovery-api)** — Explore available configurations
- **[Cache API →](cache-api)** — Optimize performance
- **[TypeScript →](typescript)** — Generate type-safe configs
