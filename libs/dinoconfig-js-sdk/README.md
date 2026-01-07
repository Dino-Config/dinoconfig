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
- [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Simple Initialization** - Single factory function following modern SDK patterns (inspired by Shopify SDK)
- **Automatic Authentication** - API key to token exchange handled automatically
- **Type-Safe** - Full TypeScript support with comprehensive type definitions
- **Zero Dependencies** - Uses native `fetch` API, no external HTTP libraries required
- **Retry Logic** - Built-in exponential backoff for failed requests
- **Timeout Support** - Configurable request timeouts
- **Modern JavaScript** - ES modules, async/await, Promise-based API

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

// Initialize the SDK with your API key (single step!)
const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_your-api-key-here',
  baseUrl: 'https://api.dinoconfig.com', // optional
  timeout: 10000 // optional, defaults to 10000ms
});

// Get a configuration value
const response = await dinoconfig.configs.getConfigValue(
  'MyBrand',      // brand name
  'AppSettings',  // config name
  'featureFlag'   // config value key
);

if (response.success) {
  console.log('Config value:', response.data);
}
```

**That's it!** The SDK handles:
- API key to access token exchange
- Authorization headers
- Request formatting and parsing

## Configuration Options

The `dinoconfigApi` function accepts a configuration object with the following options:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | `string` | **Yes** | - | Your DinoConfig API key for authentication |
| `baseUrl` | `string` | No | `'http://localhost:3000'` | Base URL for the DinoConfig API |
| `timeout` | `number` | No | `10000` | Request timeout in milliseconds |

### Example with All Options

```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_abc123def456...',
  baseUrl: 'https://api.dinoconfig.com',
  timeout: 15000
});
```

## Authentication

### How It Works

The DinoConfig SDK uses API key-based authentication with automatic token exchange:

1. **You provide an API key** - Obtained from the DinoConfig dashboard
2. **SDK exchanges it for a token** - Happens automatically during initialization
3. **Token is used for requests** - All subsequent API calls use the access token

### Getting an API Key

1. Log in to your [DinoConfig Dashboard](https://app.dinoconfig.com)
2. Navigate to **Settings** → **SDK & API Keys**
3. Click **Create New Key**
4. Provide a name and description for the key
5. **Copy the key immediately** - It won't be shown again!

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

### `dinoconfigApi(config)`

Factory function to create and initialize a DinoConfig SDK instance.

**Parameters:**
- `config` (`DinoConfigSDKConfig`) - Configuration object

**Returns:**
- `Promise<DinoConfigInstance>` - Initialized SDK instance

**Example:**
```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_your-api-key',
  baseUrl: 'https://api.dinoconfig.com',
  timeout: 10000
});
```

---

### `dinoconfig.configs.getConfigValue(brandName, configName, configValueKey, options?)`

Retrieves a specific configuration value.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brandName` | `string` | **Yes** | The name of the brand |
| `configName` | `string` | **Yes** | The name of the configuration |
| `configValueKey` | `string` | **Yes** | The key of the specific value to retrieve |
| `options` | `RequestOptions` | No | Additional request options |

**Returns:**
- `Promise<ApiResponse<any>>` - Response containing the config value

**Example:**
```typescript
// Get a feature flag value
const response = await dinoconfig.configs.getConfigValue(
  'MyBrand',
  'FeatureFlags',
  'enableDarkMode'
);

if (response.success) {
  const isDarkModeEnabled = response.data;
  console.log('Dark mode enabled:', isDarkModeEnabled);
}
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
}
```

**Example with options:**
```typescript
const response = await dinoconfig.configs.getConfigValue(
  'MyBrand',
  'Settings',
  'apiEndpoint',
  {
    timeout: 5000,
    retries: 3,
    headers: {
      'X-Request-ID': 'unique-request-id'
    }
  }
);
```

## Error Handling

The SDK throws structured errors that you can catch and handle appropriately.

### ApiError Interface

```typescript
interface ApiError {
  /** Human-readable error message */
  message: string;
  /** HTTP status code */
  status: number;
  /** Optional error code for programmatic handling */
  code?: string;
}
```

### Error Handling Example

```typescript
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

try {
  const dinoconfig = await dinoconfigApi({
    apiKey: 'dino_your-api-key'
  });

  const response = await dinoconfig.configs.getConfigValue(
    'MyBrand',
    'MyConfig',
    'myKey'
  );

  if (response.success) {
    console.log('Value:', response.data);
  }
} catch (error: any) {
  // Handle initialization errors
  if (error.message?.includes('Failed to authenticate')) {
    console.error('Invalid API key. Please check your credentials.');
  }
  // Handle API errors
  else if (error.status) {
    switch (error.status) {
      case 401:
        console.error('Unauthorized - check your API key');
        break;
      case 403:
        console.error('Forbidden - insufficient permissions');
        break;
      case 404:
        console.error('Configuration not found');
        break;
      case 429:
        console.error('Rate limited - please slow down requests');
        break;
      case 500:
        console.error('Server error - please try again later');
        break;
      default:
        console.error(`API Error (${error.status}): ${error.message}`);
    }
  }
  // Handle network/timeout errors
  else {
    console.error('Network error:', error.message);
  }
}
```

### Common Error Scenarios

| Status | Meaning | Suggested Action |
|--------|---------|------------------|
| 401 | Unauthorized | Check API key validity |
| 403 | Forbidden | Verify permissions for the resource |
| 404 | Not Found | Check brand/config/key names |
| 429 | Too Many Requests | Implement backoff, reduce request rate |
| 500 | Server Error | Retry with exponential backoff |

## TypeScript Support

The SDK is written in TypeScript and provides comprehensive type definitions.

### Exported Types

```typescript
import { 
  dinoconfigApi,
  DinoConfigInstance,
  DinoConfigSDKConfig,
  ApiResponse,
  RequestOptions,
  ConfigAPI
} from '@dinoconfig/dinoconfig-js-sdk';
```

### Type Definitions

```typescript
/** SDK configuration options */
interface DinoConfigSDKConfig {
  /** The API key for authentication */
  apiKey: string;
  /** The base URL of the DinoConfig API */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/** SDK instance returned by dinoconfigApi() */
interface DinoConfigInstance {
  /** Configuration API for managing config values */
  configs: ConfigAPI;
}

/** Standard API response wrapper */
interface ApiResponse<T = any> {
  /** Response data */
  data: T;
  /** Whether the request was successful */
  success: boolean;
  /** Optional message (usually for errors) */
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
}
```

## Examples

### Basic Usage

```typescript
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

async function main() {
  // Initialize
  const dinoconfig = await dinoconfigApi({
    apiKey: process.env.DINOCONFIG_API_KEY!
  });

  // Fetch a config value
  const response = await dinoconfig.configs.getConfigValue(
    'Acme',
    'AppSettings',
    'maxUploadSize'
  );

  console.log('Max upload size:', response.data);
}

main().catch(console.error);
```

### Express.js Integration

```typescript
import express from 'express';
import { dinoconfigApi, DinoConfigInstance } from '@dinoconfig/dinoconfig-js-sdk';

const app = express();
let dinoconfig: DinoConfigInstance;

// Initialize SDK on startup
async function initializeDinoConfig() {
  dinoconfig = await dinoconfigApi({
    apiKey: process.env.DINOCONFIG_API_KEY!,
    baseUrl: process.env.DINOCONFIG_BASE_URL
  });
  console.log('DinoConfig SDK initialized');
}

// Use in routes
app.get('/api/feature-flags/:flag', async (req, res) => {
  try {
    const response = await dinoconfig.configs.getConfigValue(
      'MyApp',
      'FeatureFlags',
      req.params.flag
    );
    res.json({ flag: req.params.flag, enabled: response.data });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

initializeDinoConfig().then(() => {
  app.listen(3000, () => console.log('Server running on port 3000'));
});
```

### Next.js API Route

```typescript
// pages/api/config/[...params].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [brandName, configName, key] = req.query.params as string[];

  try {
    const dinoconfig = await dinoconfigApi({
      apiKey: process.env.DINOCONFIG_API_KEY!
    });

    const response = await dinoconfig.configs.getConfigValue(
      brandName,
      configName,
      key
    );

    res.status(200).json(response.data);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
}
```

### With Retry Options

```typescript
const response = await dinoconfig.configs.getConfigValue(
  'MyBrand',
  'CriticalSettings',
  'databaseUrl',
  {
    timeout: 30000,  // 30 second timeout for critical config
    retries: 5       // Retry up to 5 times with exponential backoff
  }
);
```

## Requirements

- **Node.js** >= 16.0.0
- **TypeScript** >= 5.0.0 (for TypeScript projects)

## Browser Support

The SDK uses the native `fetch` API and is compatible with:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Node.js 18+ (native fetch)
- Node.js 16-17 (with `node-fetch` polyfill)

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

### Development

```bash
# Clone the repository
git clone https://github.com/dinoconfig/dinoconfig-js-sdk.git

# Install dependencies
npm install

# Build
npx nx build dinoconfig-js-sdk

# Run tests
npx nx test dinoconfig-js-sdk

# Lint
npx nx lint dinoconfig-js-sdk
```

## Support

- **Documentation**: [https://docs.dinoconfig.com](https://docs.dinoconfig.com)
- **Issues**: [GitHub Issues](https://github.com/dinoconfig/dinoconfig-js-sdk/issues)
- **Email**: support@dinoconfig.com

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with &#x2764; by the DinoConfig Team
