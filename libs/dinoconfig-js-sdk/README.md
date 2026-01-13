# DinoConfig JavaScript SDK

[![npm version](https://badge.fury.io/js/%40dinoconfig%2Fdinoconfig-js-sdk.svg)](https://www.npmjs.com/package/@dinoconfig/dinoconfig-js-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)

Official JavaScript/TypeScript SDK for the DinoConfig API. This SDK provides a simple, type-safe, and intuitive way to interact with DinoConfig's configuration management system.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Authentication](#authentication)
- [API Reference](#api-reference)
  - [Configs API](#configs-api)
  - [Discovery API](#discovery-api)
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
- **Type-Safe** - Full TypeScript support with comprehensive type definitions
- **Zero Dependencies** - Uses native `fetch` API, no external HTTP libraries required
- **Retry Logic** - Built-in exponential backoff for failed requests
- **Timeout Support** - Configurable request timeouts

## Installation

```bash
# npm
npm install @dinoconfig/dinoconfig-js-sdk

# yarn
yarn add @dinoconfig/dinoconfig-js-sdk

# pnpm
pnpm add @dinoconfig/dinoconfig-js-sdk
```

## Quick Start

```typescript
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

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
  headers?: Record<string, string>;  // Custom headers
  timeout?: number;                   // Request timeout (ms)
  retries?: number;                   // Retry attempts
}
```

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
} from '@dinoconfig/dinoconfig-js-sdk';
```

### Key Interfaces

```typescript
/** SDK instance */
interface DinoConfigInstance {
  configs: ConfigAPI;
  discovery: DiscoveryAPI;
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
```

## Examples

### Basic Usage

```typescript
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

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
import { dinoconfigApi, DinoConfigInstance } from '@dinoconfig/dinoconfig-js-sdk';

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
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';
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

## Requirements

- **Node.js** >= 16.0.0
- **TypeScript** >= 5.0.0 (for TypeScript projects)

## Contributing

```bash
# Clone and install
git clone https://github.com/dinoconfig/dinoconfig-js-sdk.git
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
