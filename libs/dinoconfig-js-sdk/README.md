# DinoConfig JavaScript SDK

[![npm version](https://img.shields.io/npm/v/@dinoconfig/js-sdk.svg)](https://www.npmjs.com/package/@dinoconfig/js-sdk)
[![npm downloads](https://img.shields.io/npm/dm/@dinoconfig/js-sdk.svg)](https://www.npmjs.com/package/@dinoconfig/js-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

Official JavaScript/TypeScript SDK for the DinoConfig API. This SDK provides a simple, type-safe, and intuitive way to interact with DinoConfig's configuration management system.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Authentication](#authentication)
- [Caching](#caching)
- [API Reference](#api-reference)
  - [Configs API](#configs-api)
  - [Discovery API](#discovery-api)
- [Code Generation](#code-generation)
- [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Simple Initialization** - Single factory function following modern SDK patterns
- **Automatic Authentication** - API key to token exchange handled automatically
- **Shorthand Path Syntax** - Use `"Brand.Config.Key"` dot notation for concise access
- **Discovery API** - Discover brands, configs, and schemas dynamically
- **Full Introspection** - Get complete visibility into all available configurations
- **Multi-Layer Caching** - In-memory (L1) and persistent storage (L2) caching for improved performance
- **Code Generation** - Generate TypeScript types from your config schemas
- **Type-Safe** - Full TypeScript support with comprehensive type definitions
- **Zero Dependencies** - Uses native `fetch` API, no external HTTP libraries required
- **Retry Logic** - Built-in exponential backoff for failed requests
- **Timeout Support** - Configurable request timeouts

## Installation

```bash
# npm
npm install @dinoconfig/js-sdk

# yarn
yarn add @dinoconfig/js-sdk

# pnpm
pnpm add @dinoconfig/js-sdk
```

## Quick Start

```typescript
import { dinoconfigApi } from '@dinoconfig/js-sdk';

// Initialize the SDK
const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_your-api-key-here',
  baseUrl: 'https://api.dinoconfig.com', // optional
  timeout: 10000 // optional
});

// Get entire config
const config = await dinoconfig.configs.get('MyBrand', 'AppSettings');
console.log('All values:', config.data.values);

// Get single value (shorthand)
const theme = await dinoconfig.configs.getValue('MyBrand.AppSettings.theme');
console.log('Theme:', theme.data);

// Get single value (full params)
const response = await dinoconfig.configs.getValue('MyBrand', 'AppSettings', 'theme');
console.log('Theme:', response.data);
```

**That's it!** The SDK handles:
- API key to access token exchange
- Authorization headers
- Request formatting and parsing

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | `string` | **Yes** | - | Your DinoConfig API key |
| `baseUrl` | `string` | No | `'http://localhost:3000'` | Base URL for the API |
| `timeout` | `number` | No | `10000` | Request timeout in milliseconds |
| `cache` | `CacheConfig` | No | `{ enabled: false }` | Cache configuration (see [Caching](#caching)) |

### Example with All Options

```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_abc123def456...',
  baseUrl: 'https://api.dinoconfig.com',
  timeout: 15000,
  cache: {
    enabled: true,
    ttl: 60000,
    storage: 'localStorage',
  }
});
```

## Caching

The SDK includes a powerful multi-layer caching system that significantly improves performance by reducing network requests.

### Cache Layers

The cache operates on two layers:

1. **L1 - Memory Cache** (Fast, short-lived)
   - In-memory storage for instant access
   - Default TTL: 60 seconds (configurable)
   - Cleared when the application restarts

2. **L2 - Storage Cache** (Persistent, longer-lived)
   - Browser `localStorage` or `IndexedDB` (future)
   - Persists across page reloads
   - Default TTL: 5 minutes (configurable)

### Cache Flow

```
Request → L1 Memory Cache → L2 Storage Cache → Network API
         (if miss)         (if miss)         (source of truth)
```

### Enabling Caching

```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_your-api-key',
  cache: {
    enabled: true,              // Enable caching
    ttl: 60000,                 // 1 minute TTL for memory cache
    maxSize: 1000,              // Maximum cache entries
    storage: 'localStorage',    // Use localStorage for persistence
    staleWhileRevalidate: false // Return stale data while refreshing
  }
});
```

### Cache Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Whether caching is enabled |
| `ttl` | `number` | `60000` | Time-to-live in milliseconds (1 minute) |
| `maxSize` | `number` | `1000` | Maximum number of entries in memory cache |
| `storage` | `'memory' \| 'localStorage' \| 'indexedDB'` | `undefined` | Storage backend for L2 cache |
| `staleWhileRevalidate` | `boolean` | `false` | Return stale data while fetching fresh data |

### Cache-Aware Requests

All API methods automatically use the cache when enabled. You can control caching behavior per request:

```typescript
// Use cache (default behavior when cache is enabled)
const response = await dinoconfig.configs.getValue(
  'Brand', 'Config', 'key'
);

// Force refresh (bypass cache)
const response = await dinoconfig.configs.getValue(
  'Brand', 'Config', 'key',
  { forceRefresh: true }
);

// Disable cache for this request
const response = await dinoconfig.configs.getValue(
  'Brand', 'Config', 'key',
  { cache: false }
);
```

### Cache Management

The SDK exposes a `cache` API for manual cache control:

```typescript
// Get cache statistics
const stats = dinoconfig.cache.getStats();
console.log(`Hits: ${stats.hits}, Misses: ${stats.misses}, Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%`);

// Clear all cache
await dinoconfig.cache.clear();

// Invalidate cache by pattern (regex)
await dinoconfig.cache.invalidate('brand:Paysafe:*'); // Clear all Paysafe configs
await dinoconfig.cache.invalidate('config:.*:.*:featureFlag'); // Clear all feature flags

// Prefetch a value into cache
await dinoconfig.cache.prefetch('key', async () => {
  return await dinoconfig.configs.getValue('Brand', 'Config', 'key');
});
```

### Cache Performance

With caching enabled, subsequent requests to the same configuration value are served from cache, providing:

- **99%+ faster response times** - Cache hits typically take < 5ms vs 200-500ms for network requests
- **Reduced API costs** - Fewer network requests
- **Better offline experience** - Cached values available when network is unavailable
- **Improved user experience** - Instant configuration value access

### Example: Cache in Action

```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_...',
  cache: {
    enabled: true,
    ttl: 60000,
    storage: 'localStorage',
  }
});

// First request - hits network (~250ms)
console.time('first');
const response1 = await dinoconfig.configs.getValue('Brand', 'Config', 'key');
console.timeEnd('first'); // ~250ms

// Second request - served from cache (~1ms)
console.time('second');
const response2 = await dinoconfig.configs.getValue('Brand', 'Config', 'key');
console.timeEnd('second'); // ~1ms ⚡

// Check cache performance
const stats = dinoconfig.cache.getStats();
console.log(`Cache hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
```

### Cache Best Practices

1. **Enable caching for production** - Significantly improves performance
2. **Use appropriate TTL** - Balance freshness vs performance (1-5 minutes recommended)
3. **Use localStorage for browser apps** - Persists across page reloads
4. **Invalidate cache on updates** - Use cache invalidation when you know configs changed
5. **Monitor cache hit rates** - Use `getStats()` to track cache effectiveness

## Authentication

### Security Best Practices

```typescript
// DO: Use environment variables
const dinoconfig = await dinoconfigApi({
  apiKey: process.env.DINOCONFIG_API_KEY!,
  baseUrl: process.env.DINOCONFIG_BASE_URL
});

// DON'T: Hardcode API keys in source code
const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_abc123...' // Never do this in production!
});
```

## API Reference

### Configs API

The Configs API provides methods to retrieve configuration values.

---

#### `configs.get(path, options?)` / `configs.get(brand, config, options?)`

Retrieves an entire configuration with all its values.

**Signatures:**
```typescript
// Shorthand path
get(path: string, options?: RequestOptions): Promise<ApiResponse<ConfigData>>

// Full parameters
get(brand: string, config: string, options?: RequestOptions): Promise<ApiResponse<ConfigData>>
```

**Returns:** `ApiResponse<ConfigData>` containing:
- `name` - Configuration name
- `description` - Configuration description
- `values` - All key-value pairs as `Record<string, unknown>`
- `version` - Configuration version
- `keys` - Array of all key names
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Examples:**
```typescript
// Shorthand path
const config = await dinoconfig.configs.get('MyBrand.FeatureFlags');
console.log(config.data.values);
// { enableDarkMode: true, maxUsers: 100, ... }

// Full parameters
const config = await dinoconfig.configs.get('MyBrand', 'FeatureFlags');
console.log(`Version: ${config.data.version}`);
console.log(`Keys: ${config.data.keys.join(', ')}`);

// Access specific values
const { values } = config.data;
const darkMode = values.enableDarkMode as boolean;
const maxUsers = values.maxUsers as number;
```

---

#### `configs.getValue(path, options?)` / `configs.getValue(brand, config, key, options?)`

Retrieves a specific configuration value.

**Signatures:**
```typescript
// Shorthand path
getValue(path: string, options?: RequestOptions): Promise<ApiResponse<unknown>>

// Full parameters
getValue(brand: string, config: string, key: string, options?: RequestOptions): Promise<ApiResponse<unknown>>
```

**Examples:**
```typescript
// Shorthand path (recommended)
const response = await dinoconfig.configs.getValue('MyBrand.FeatureFlags.enableDarkMode');
console.log('Dark mode:', response.data); // true

// Full parameters
const response = await dinoconfig.configs.getValue('MyBrand', 'FeatureFlags', 'enableDarkMode');
console.log('Dark mode:', response.data);

// With request options
const response = await dinoconfig.configs.getValue(
  'MyBrand.CriticalConfig.databaseUrl',
  { timeout: 30000, retries: 5 }
);
```

---

### Discovery API

The Discovery API enables dynamic configuration discovery.

---

#### `discovery.listBrands(options?)`

Lists all brands accessible by your API key.

**Returns:** `ApiResponse<BrandInfo[]>`

```typescript
const response = await dinoconfig.discovery.listBrands();
response.data.forEach(brand => {
  console.log(`${brand.name}: ${brand.configCount} configs`);
});
```

---

#### `discovery.listConfigs(brandName, options?)`

Lists all configurations for a specific brand.

**Returns:** `ApiResponse<ConfigInfo[]>`

```typescript
const response = await dinoconfig.discovery.listConfigs('MyBrand');
response.data.forEach(config => {
  console.log(`${config.name} (v${config.version}): ${config.keys.length} keys`);
});
```

---

#### `discovery.getSchema(brandName, configName, options?)`

Gets the schema/structure for a specific configuration.

**Returns:** `ApiResponse<ConfigSchema>`

```typescript
const response = await dinoconfig.discovery.getSchema('MyBrand', 'FeatureFlags');
Object.entries(response.data.fields).forEach(([name, field]) => {
  console.log(`${name}: ${field.type}${field.required ? ' (required)' : ''}`);
});
```

---

#### `discovery.introspect(options?)`

Performs full introspection, returning all brands, configs, and values.

**Returns:** `ApiResponse<IntrospectionResult>`

```typescript
const response = await dinoconfig.discovery.introspect();
const { company, brands } = response.data;

console.log(`Company: ${company}`);
brands.forEach(brand => {
  console.log(`\nBrand: ${brand.name}`);
  brand.configs.forEach(config => {
    console.log(`  Config: ${config.name} (${config.keys.length} keys)`);
  });
});
```

---

### Request Options

All API methods accept an optional `RequestOptions` object:

```typescript
interface RequestOptions {
  /** Custom headers for this specific request */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds (overrides default) */
  timeout?: number;
  /** Number of retry attempts for failed requests */
  retries?: number;
  /** Whether to use cache (default: true when cache is enabled) */
  cache?: boolean;
  /** Force refresh from API, bypassing cache */
  forceRefresh?: boolean;
}
```

**Example with options:**
```typescript
const response = await dinoconfig.configs.getValue(
  'MyBrand',
  'Settings',
  'apiEndpoint',
  {
    timeout: 5000,
    retries: 3,
    cache: true,              // Use cache (default)
    forceRefresh: false,      // Don't bypass cache
    headers: {
      'X-Request-ID': 'unique-request-id'
    }
  }
);
```

## Code Generation

Generate TypeScript types from your DinoConfig schemas using the [@dinoconfig/cli](https://www.npmjs.com/package/@dinoconfig/cli) package:

```bash
# Install CLI
npm install -g @dinoconfig/cli

# Generate types
npx @dinoconfig/cli codegen --api-key=dino_xxx --output=./src/types/dinoconfig.d.ts
```

### Usage with Generated Types

```typescript
import { dinoconfigApi } from '@dinoconfig/js-sdk';
import { DinoConfig } from './types/dinoconfig';

const dinoconfig = await dinoconfigApi({
  apiKey: process.env.DINOCONFIG_API_KEY!
});

// Full type safety with generics
const flags = await dinoconfig.configs.get<DinoConfig.MyBrand.FeatureFlags>(
  'MyBrand',
  'FeatureFlags'
);

// TypeScript knows the exact types!
flags.data.values.enableDarkMode; // boolean ✓
flags.data.values.maxUploadSize;  // number ✓
```

For full documentation, see [@dinoconfig/cli](https://www.npmjs.com/package/@dinoconfig/cli).
## Error Handling

```typescript
try {
  const response = await dinoconfig.configs.getValue('Brand.Config.Key');
  console.log('Value:', response.data);
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

### Common Error Scenarios

| Status | Meaning | Suggested Action |
|--------|---------|------------------|
| 401 | Unauthorized | Check API key validity |
| 403 | Forbidden | Verify permissions |
| 404 | Not Found | Check brand/config/key names |
| 429 | Rate Limited | Implement backoff |
| 500 | Server Error | Retry with backoff |

## TypeScript Support

### Exported Types

```typescript
import {
  // Main SDK
  dinoconfigApi,
  DinoConfigInstance,
  DinoConfigSDKConfig,
  ApiResponse,
  RequestOptions,

  // APIs
  ConfigAPI,
  DiscoveryAPI,
  CacheAPI,

  // Config types
  ConfigData,

  // Discovery types
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
  CacheConfig,
  CacheStats
} from '@dinoconfig/js-sdk';
```

### Key Interfaces

```typescript
/** SDK configuration options */
interface DinoConfigSDKConfig {
  /** The API key for authentication */
  apiKey: string;
  /** The base URL of the DinoConfig API */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Cache configuration options */
  cache?: Partial<CacheConfig>;
}

/** SDK instance returned by dinoconfigApi() */
interface DinoConfigInstance {
  /** Configuration API for retrieving config values */
  configs: ConfigAPI;
  /** Discovery API for exploring available brands, configs, and schemas */
  discovery: DiscoveryAPI;
  /** Cache API for managing the cache layer */
  cache: CacheAPI;
}

/** Full config data */
interface ConfigData {
  readonly name: string;
  readonly description?: string;
  readonly values: Record<string, unknown>;
  readonly version: number;
  readonly keys: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

/** API response wrapper */
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/** Request customization options */
interface RequestOptions {
  /** Custom headers */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts */
  retries?: number;
  /** Whether to use cache (default: true when cache is enabled) */
  cache?: boolean;
  /** Force refresh from API, bypassing cache */
  forceRefresh?: boolean;
}
```

## Examples

### Basic Usage

```typescript
import { dinoconfigApi } from '@dinoconfig/js-sdk';

const dinoconfig = await dinoconfigApi({
  apiKey: process.env.DINOCONFIG_API_KEY!
});

// Get entire config
const config = await dinoconfig.configs.get('Brand.Config');
console.log(config.data.values);

// Get single value
const value = await dinoconfig.configs.getValue('Brand.Config.Key');
console.log(value.data);
```

### Express.js Integration

```typescript
import express from 'express';
import { dinoconfigApi, DinoConfigInstance } from '@dinoconfig/js-sdk';

let dinoconfig: DinoConfigInstance;

async function initApp() {
  dinoconfig = await dinoconfigApi({
    apiKey: process.env.DINOCONFIG_API_KEY!
  });

  const app = express();

  app.get('/config/:brand/:config/:key', async (req, res) => {
    try {
      const { brand, config, key } = req.params;
      const response = await dinoconfig.configs.getValue(brand, config, key);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch config' });
    }
  });

  app.listen(3000);
}

initApp();
```

### Next.js API Route

```typescript
// app/api/config/[...path]/route.ts
import { dinoconfigApi } from '@dinoconfig/js-sdk';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const [brand, config, key] = params.path;

  const dinoconfig = await dinoconfigApi({
    apiKey: process.env.DINOCONFIG_API_KEY!
  });

  const response = await dinoconfig.configs.getValue(brand, config, key);
  return NextResponse.json(response.data);
}
```

### With Caching

```typescript
// Initialize with cache enabled
const dinoconfig = await dinoconfigApi({
  apiKey: process.env.DINOCONFIG_API_KEY!,
  cache: {
    enabled: true,
    ttl: 60000,           // 1 minute
    storage: 'localStorage',
  }
});

// First request - network call (~250ms)
const response1 = await dinoconfig.configs.getValue('MyBrand', 'Settings', 'apiUrl');

// Second request - cached (~1ms) ⚡
const response2 = await dinoconfig.configs.getValue('MyBrand', 'Settings', 'apiUrl');

// Force refresh when needed
const freshResponse = await dinoconfig.configs.getValue(
  'MyBrand',
  'Settings',
  'apiUrl',
  { forceRefresh: true }
);

// Check cache performance
const stats = dinoconfig.cache.getStats();
console.log(`Cache hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
```
## Requirements

- **Node.js** >= 18.0.0 (for native `fetch` support)
- **TypeScript** >= 5.0.0 (for TypeScript projects)

## Contributing

```bash
# Clone and install
git https://github.com/Dino-Config/dinoconfig
npm install

# Build
npx nx build dinoconfig-js-sdk

# Test
npx nx test dinoconfig-js-sdk

# Lint
npx nx lint dinoconfig-js-sdk
```

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with ❤️ by the DinoConfig Team
