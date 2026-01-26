---
sidebar_position: 2
title: SDK Configuration Options
description: Configure the DinoConfig JavaScript SDK with custom options for authentication, caching, timeouts, and request handling.
keywords: [javascript sdk configuration, caching, timeout, api key, authentication, sdk options]
---

# Configuration

The DinoConfig JavaScript SDK can be configured with various options to customize its behavior for your specific use case.

## Configuration Options

```typescript
interface DinoConfigSDKConfig {
  apiKey: string;                    // Required
  baseUrl?: string;                  // Optional
  timeout?: number;                  // Optional
  cache?: Partial<CacheConfig>;      // Optional
}
```

### Required Options

#### `apiKey`

Your DinoConfig API key. Keys are prefixed with `dino_`.

```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_abc123xyz789',
});
```

:::tip Getting an API Key
You can generate API keys from the [DinoConfig Dashboard](https://dinoconfig.com). Each key can have different permission levels.
:::

### Optional Options

#### `baseUrl`

The base URL for the DinoConfig API. Defaults to `http://localhost:3000` for local development.

```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_your-api-key',
  baseUrl: 'https://api.dinoconfig.com', // Production
});
```

#### `timeout`

Request timeout in milliseconds. Defaults to `10000` (10 seconds).

```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_your-api-key',
  timeout: 30000, // 30 seconds
});
```

#### `cache`

Cache configuration for optimizing performance. See [Cache Configuration](#cache-configuration) below.

## Cache Configuration

The SDK supports a sophisticated multi-layer caching system to minimize API calls and improve performance.

```typescript
interface CacheConfig {
  enabled: boolean;           // Enable/disable caching
  ttl: number;               // Time-to-live in milliseconds
  maxSize: number;           // Maximum number of cache entries
  storage?: 'memory' | 'localStorage' | 'indexedDB';
  staleWhileRevalidate?: boolean;
}
```

### Cache Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Enable caching |
| `ttl` | `number` | `60000` | Cache TTL in ms (1 minute) |
| `maxSize` | `number` | `1000` | Max cache entries |
| `storage` | `string` | `undefined` | Storage backend |
| `staleWhileRevalidate` | `boolean` | `false` | Return stale data while refreshing |

### Example: Production Configuration

```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: process.env.DINOCONFIG_API_KEY!,
  baseUrl: 'https://api.dinoconfig.com',
  timeout: 15000,
  cache: {
    enabled: true,
    ttl: 300000,              // 5 minutes
    maxSize: 500,
    storage: 'localStorage',   // Persist across page reloads
    staleWhileRevalidate: true,
  },
});
```

### Storage Backends

#### Memory (Default)

Fast, in-memory storage. Data is lost on page refresh.

```typescript
cache: {
  enabled: true,
  storage: 'memory',
}
```

#### localStorage

Persists data across browser sessions. Subject to 5MB limit.

```typescript
cache: {
  enabled: true,
  storage: 'localStorage',
}
```

#### IndexedDB

Larger storage capacity, ideal for caching many configurations.

```typescript
cache: {
  enabled: true,
  storage: 'indexedDB',
}
```

## Request Options

Individual API calls can be customized with request options:

```typescript
interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  forceRefresh?: boolean;
  ttl?: number;
}
```

### Per-Request Configuration

```typescript
// Custom timeout for a slow request
const config = await dinoconfig.configs.get('Brand.Config', {
  timeout: 60000,
});

// Skip cache and force fresh data
const freshConfig = await dinoconfig.configs.get('Brand.Config', {
  forceRefresh: true,
});

// Custom retry behavior
const reliableConfig = await dinoconfig.configs.get('Brand.Config', {
  retries: 5,
});

// Disable caching for this request only
const uncachedValue = await dinoconfig.configs.getValue('Brand.Config.Key', {
  cache: false,
});
```

## Configuration Patterns

### Development Environment

```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: process.env.DINOCONFIG_API_KEY!,
  baseUrl: 'http://localhost:3000',
  timeout: 5000,
  cache: {
    enabled: false, // Disable cache during development
  },
});
```

### Production Environment

```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: process.env.DINOCONFIG_API_KEY!,
  baseUrl: 'https://api.dinoconfig.com',
  timeout: 15000,
  cache: {
    enabled: true,
    ttl: 300000,              // 5 minutes
    maxSize: 1000,
    storage: 'localStorage',
    staleWhileRevalidate: true,
  },
});
```

### Server-Side (Node.js)

```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: process.env.DINOCONFIG_API_KEY!,
  baseUrl: process.env.DINOCONFIG_BASE_URL!,
  timeout: 10000,
  cache: {
    enabled: true,
    ttl: 60000,   // 1 minute
    maxSize: 500,
    storage: 'memory', // In-memory only for Node.js
  },
});
```

### Edge Functions / Serverless

```typescript
// Keep it simple for cold starts
const dinoconfig = await dinoconfigApi({
  apiKey: process.env.DINOCONFIG_API_KEY!,
  baseUrl: 'https://api.dinoconfig.com',
  timeout: 5000,
  cache: {
    enabled: false, // Cache may not persist between invocations
  },
});
```

## Error Handling

The SDK throws `ApiError` for failed requests:

```typescript
import { dinoconfigApi, ApiError } from '@dinoconfig/dinoconfig-js-sdk';

try {
  const dinoconfig = await dinoconfigApi({
    apiKey: 'invalid_key',
  });
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
  }
}
```

## Next Steps

- **[Configs API →](configs-api)** — Learn to fetch configurations
- **[Cache API →](cache-api)** — Deep dive into caching
- **[Examples →](examples)** — Real-world usage patterns
