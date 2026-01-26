---
sidebar_position: 7
title: Examples
description: Real-world examples and patterns for using the DinoConfig JavaScript SDK.
---

# Examples

This page provides real-world examples and patterns for common use cases with the DinoConfig JavaScript SDK.

## Basic Usage

### Simple Configuration Fetch

```typescript
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

async function getAppConfig() {
  const dinoconfig = await dinoconfigApi({
    apiKey: process.env.DINOCONFIG_API_KEY!,
    baseUrl: 'https://api.dinoconfig.com',
  });

  const config = await dinoconfig.configs.get('MyApp.Settings');
  
  return {
    theme: config.data.values.theme,
    maxItems: config.data.values.maxItems,
    apiEndpoint: config.data.values.apiEndpoint,
  };
}
```

### Feature Flags

```typescript
interface FeatureFlags {
  darkMode: boolean;
  newDashboard: boolean;
  betaFeatures: boolean;
  maxUploadSize: number;
}

async function getFeatureFlags(): Promise<FeatureFlags> {
  const dinoconfig = await dinoconfigApi({
    apiKey: process.env.DINOCONFIG_API_KEY!,
  });

  const flags = await dinoconfig.configs.get<FeatureFlags>('MyApp.FeatureFlags');
  
  return flags.data.values;
}

// Usage
const flags = await getFeatureFlags();
if (flags.darkMode) {
  enableDarkMode();
}
```

## React Integration

### Configuration Context

```typescript title="src/context/ConfigContext.tsx"
import React, { createContext, useContext, useEffect, useState } from 'react';
import { dinoconfigApi, DinoConfigInstance } from '@dinoconfig/dinoconfig-js-sdk';

interface AppConfig {
  theme: 'light' | 'dark';
  features: string[];
  maxItems: number;
}

interface ConfigContextType {
  config: AppConfig | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sdk, setSdk] = useState<DinoConfigInstance | null>(null);

  useEffect(() => {
    initSDK();
  }, []);

  async function initSDK() {
    try {
      const dinoconfig = await dinoconfigApi({
        apiKey: process.env.REACT_APP_DINOCONFIG_API_KEY!,
        cache: { enabled: true, ttl: 300000 },
      });
      setSdk(dinoconfig);
      await fetchConfig(dinoconfig);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }

  async function fetchConfig(dinoconfig: DinoConfigInstance) {
    setLoading(true);
    try {
      const response = await dinoconfig.configs.get<AppConfig>('MyApp.Settings');
      setConfig(response.data.values);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (sdk) {
      await fetchConfig(sdk);
    }
  }

  return (
    <ConfigContext.Provider value={{ config, loading, error, refresh }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
}
```

### Using the Hook

```typescript title="src/components/Dashboard.tsx"
import { useConfig } from '../context/ConfigContext';

export function Dashboard() {
  const { config, loading, error, refresh } = useConfig();

  if (loading) return <div>Loading configuration...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!config) return null;

  return (
    <div className={`dashboard theme-${config.theme}`}>
      <h1>Dashboard</h1>
      <p>Max items: {config.maxItems}</p>
      <button onClick={refresh}>Refresh Config</button>
    </div>
  );
}
```

## Next.js Integration

### Server Component

```typescript title="app/page.tsx"
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

interface PageConfig {
  title: string;
  description: string;
  showBanner: boolean;
}

async function getPageConfig() {
  const dinoconfig = await dinoconfigApi({
    apiKey: process.env.DINOCONFIG_API_KEY!,
    baseUrl: process.env.DINOCONFIG_BASE_URL!,
  });

  const config = await dinoconfig.configs.get<PageConfig>('MyApp.HomePage');
  return config.data.values;
}

export default async function HomePage() {
  const config = await getPageConfig();

  return (
    <main>
      <h1>{config.title}</h1>
      <p>{config.description}</p>
      {config.showBanner && <Banner />}
    </main>
  );
}
```

### API Route Handler

```typescript title="app/api/config/route.ts"
import { NextResponse } from 'next/server';
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

let sdk: Awaited<ReturnType<typeof dinoconfigApi>> | null = null;

async function getSDK() {
  if (!sdk) {
    sdk = await dinoconfigApi({
      apiKey: process.env.DINOCONFIG_API_KEY!,
      cache: { enabled: true, ttl: 60000 },
    });
  }
  return sdk;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 });
  }

  try {
    const dinoconfig = await getSDK();
    const config = await dinoconfig.configs.get(path);
    return NextResponse.json(config.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}
```

## Express.js Integration

### Middleware

```typescript title="src/middleware/config.ts"
import { Request, Response, NextFunction } from 'express';
import { dinoconfigApi, DinoConfigInstance } from '@dinoconfig/dinoconfig-js-sdk';

let sdk: DinoConfigInstance;

export async function initConfig() {
  sdk = await dinoconfigApi({
    apiKey: process.env.DINOCONFIG_API_KEY!,
    cache: { enabled: true, ttl: 300000 },
  });
}

export async function configMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const config = await sdk.configs.get('MyApp.ServerConfig');
    req.appConfig = config.data.values;
    next();
  } catch (error) {
    console.error('Failed to load config:', error);
    res.status(500).json({ error: 'Configuration unavailable' });
  }
}

// Type augmentation
declare global {
  namespace Express {
    interface Request {
      appConfig: Record<string, unknown>;
    }
  }
}
```

### Usage

```typescript title="src/app.ts"
import express from 'express';
import { initConfig, configMiddleware } from './middleware/config';

const app = express();

async function start() {
  await initConfig();

  app.use(configMiddleware);

  app.get(api/settings', (req, res) => {
    res.json(req.appConfig);
  });

  app.listen(3000);
}

start();
```

## Error Handling Patterns

### Retry with Fallback

```typescript
import { dinoconfigApi, ApiError } from '@dinoconfig/dinoconfig-js-sdk';

interface AppConfig {
  theme: string;
  maxItems: number;
}

const DEFAULT_CONFIG: AppConfig = {
  theme: 'light',
  maxItems: 50,
};

async function getConfigWithFallback(): Promise<AppConfig> {
  try {
    const dinoconfig = await dinoconfigApi({
      apiKey: process.env.DINOCONFIG_API_KEY!,
    });

    const response = await dinoconfig.configs.get<AppConfig>('MyApp.Settings', {
      retries: 3,
      timeout: 10000,
    });

    return response.data.values;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`Config fetch failed (${error.status}): ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }

    console.log('Using default configuration');
    return DEFAULT_CONFIG;
  }
}
```

### Circuit Breaker

```typescript
class ConfigCircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private readonly threshold = 5;
  private readonly resetTimeout = 60000;

  async getConfig<T>(
    sdk: DinoConfigInstance,
    path: string
  ): Promise<T | null> {
    // Check if circuit is open
    if (this.isOpen()) {
      console.warn('Circuit breaker is open, skipping request');
      return null;
    }

    try {
      const response = await sdk.configs.get<T>(path);
      this.reset();
      return response.data.values;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    if (this.failures >= this.threshold) {
      const elapsed = Date.now() - this.lastFailure;
      if (elapsed < this.resetTimeout) {
        return true;
      }
      this.reset();
    }
    return false;
  }

  private recordFailure() {
    this.failures++;
    this.lastFailure = Date.now();
  }

  private reset() {
    this.failures = 0;
  }
}
```

## Caching Patterns

### Warm Cache on Startup

```typescript
async function warmCache(sdk: DinoConfigInstance) {
  const criticalConfigs = [
    'MyApp.Settings',
    'MyApp.FeatureFlags',
    'MyApp.Limits',
    'MyApp.Database',
  ];

  console.log('Warming cache...');

  await Promise.all(
    criticalConfigs.map(async (path) => {
      try {
        await sdk.configs.get(path);
        console.log(`  ✓ ${path}`);
      } catch (error) {
        console.error(`  ✗ ${path}: ${error}`);
      }
    })
  );

  const stats = sdk.cache.getStats();
  console.log(`Cache warmed: ${stats.size} entries`);
}
```

### Cache Invalidation WebSocket

```typescript
import { WebSocket } from 'ws';

function setupConfigSync(sdk: DinoConfigInstance) {
  const ws = new WebSocket('wss://api.dinoconfig.com/ws');

  ws.on('message', async (data) => {
    const event = JSON.parse(data.toString());

    if (event.type === 'CONFIG_UPDATED') {
      const { brandName, configName } = event.payload;
      
      // Invalidate specific config
      await sdk.cache.invalidate(`config:${brandName}:${configName}.*`);
      
      // Optionally prefetch the updated config
      await sdk.configs.get(`${brandName}.${configName}`, {
        forceRefresh: true,
      });

      console.log(`Config updated: ${brandName}.${configName}`);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  return ws;
}
```

## Testing

### Mocking the SDK

```typescript title="__mocks__/dinoconfig.ts"
export const mockConfigs = {
  get: jest.fn(),
  getValue: jest.fn(),
};

export const mockDiscovery = {
  listBrands: jest.fn(),
  listConfigs: jest.fn(),
  getSchema: jest.fn(),
  introspect: jest.fn(),
};

export const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  invalidate: jest.fn(),
  prefetch: jest.fn(),
  getStats: jest.fn(),
};

export const dinoconfigApi = jest.fn().mockResolvedValue({
  configs: mockConfigs,
  discovery: mockDiscovery,
  cache: mockCache,
});
```

### Test Example

```typescript title="__tests__/config.test.ts"
import { dinoconfigApi, mockConfigs } from '../__mocks__/dinoconfig';
import { getAppConfig } from '../src/config';

jest.mock('@dinoconfig/dinoconfig-js-sdk', () => ({
  dinoconfigApi,
}));

describe('getAppConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return app configuration', async () => {
    mockConfigs.get.mockResolvedValue({
      success: true,
      data: {
        values: {
          theme: 'dark',
          maxItems: 100,
        },
      },
    });

    const config = await getAppConfig();

    expect(config).toEqual({
      theme: 'dark',
      maxItems: 100,
    });
    expect(mockConfigs.get).toHaveBeenCalledWith('MyApp.Settings');
  });

  it('should handle errors', async () => {
    mockConfigs.get.mockRejectedValue(new Error('API Error'));

    await expect(getAppConfig()).rejects.toThrow('API Error');
  });
});
```

## Environment-Specific Configuration

### Multi-Environment Setup

```typescript
type Environment = 'development' | 'staging' | 'production';

function getEnvConfig(env: Environment) {
  const configs: Record<Environment, { baseUrl: string; cacheEnabled: boolean }> = {
    development: {
      baseUrl: 'http://localhost:3000',
      cacheEnabled: false,
    },
    staging: {
      baseUrl: 'https://staging-api.dinoconfig.com',
      cacheEnabled: true,
    },
    production: {
      baseUrl: 'https://api.dinoconfig.com',
      cacheEnabled: true,
    },
  };

  return configs[env];
}

async function createClient(env: Environment = 'production') {
  const envConfig = getEnvConfig(env);

  return dinoconfigApi({
    apiKey: process.env.DINOCONFIG_API_KEY!,
    baseUrl: envConfig.baseUrl,
    cache: {
      enabled: envConfig.cacheEnabled,
      ttl: env === 'production' ? 300000 : 30000,
    },
  });
}
```

## Related Resources

- **[Getting Started →](getting-started)** — Initial setup guide
- **[Configuration →](configuration)** — SDK configuration options
- **[TypeScript →](typescript)** — Type-safe configuration access
