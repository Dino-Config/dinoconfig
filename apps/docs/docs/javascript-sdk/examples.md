---
sidebar_position: 7
title: Examples
description: Real-world examples for the DinoConfig JavaScript SDK.
---

# Examples

Common patterns and integrations for the DinoConfig JavaScript SDK.

## Basic Usage

```typescript
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

const dinoconfig = await dinoconfigApi({
  apiKey: process.env.DINOCONFIG_API_KEY!,
});

// Get configuration
const config = await dinoconfig.configs.get('MyApp.Settings');
console.log(config.data.values);

// Get single value with type
const theme = await dinoconfig.configs.getValue<string>('MyApp.Settings.theme');
```

## Feature Flags

```typescript
interface FeatureFlags {
  darkMode: boolean;
  newDashboard: boolean;
}

async function getFeatureFlags(): Promise<FeatureFlags> {
  const dinoconfig = await dinoconfigApi({ apiKey: process.env.DINOCONFIG_API_KEY! });
  const flags = await dinoconfig.configs.get<FeatureFlags>('MyApp.FeatureFlags');
  return flags.data.values;
}

const flags = await getFeatureFlags();
if (flags.darkMode) {
  enableDarkMode();
}
```

## React Context

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { dinoconfigApi, DinoConfigInstance } from '@dinoconfig/dinoconfig-js-sdk';

interface ConfigContextType {
  config: AppConfig | null;
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextType>({ config: null, loading: true });

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dinoconfigApi({ apiKey: process.env.REACT_APP_DINOCONFIG_API_KEY! })
      .then(sdk => sdk.configs.get<AppConfig>('MyApp.Settings'))
      .then(res => setConfig(res.data.values))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
```

## Next.js Server Component

```typescript
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

async function getConfig() {
  const sdk = await dinoconfigApi({ apiKey: process.env.DINOCONFIG_API_KEY! });
  return sdk.configs.get<PageConfig>('MyApp.HomePage');
}

export default async function HomePage() {
  const { data } = await getConfig();
  return <h1>{data.values.title}</h1>;
}
```

## Express Middleware

```typescript
import { dinoconfigApi, DinoConfigInstance } from '@dinoconfig/dinoconfig-js-sdk';

let sdk: DinoConfigInstance;

export async function initConfig() {
  sdk = await dinoconfigApi({ apiKey: process.env.DINOCONFIG_API_KEY! });
}

export async function configMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const config = await sdk.configs.get('MyApp.ServerConfig');
    req.appConfig = config.data.values;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Configuration unavailable' });
  }
}
```

## Error Handling with Fallback

```typescript
const DEFAULT_CONFIG = { theme: 'light', maxItems: 50 };

async function getConfigWithFallback() {
  try {
    const sdk = await dinoconfigApi({ apiKey: process.env.DINOCONFIG_API_KEY! });
    const response = await sdk.configs.get('MyApp.Settings', { retries: 3 });
    return response.data.values;
  } catch (error) {
    console.error('Using default config:', error);
    return DEFAULT_CONFIG;
  }
}
```

## Cache Warming

```typescript
async function warmCache(sdk: DinoConfigInstance) {
  const configs = ['MyApp.Settings', 'MyApp.FeatureFlags', 'MyApp.Limits'];
  
  await Promise.all(configs.map(path => sdk.configs.get(path)));
  
  console.log('Cache warmed:', sdk.cache.getStats());
}
```

## Testing with Mocks

```typescript
// __mocks__/dinoconfig.ts
export const mockConfigs = { get: jest.fn(), getValue: jest.fn() };
export const dinoconfigApi = jest.fn().mockResolvedValue({ configs: mockConfigs });

// test.ts
jest.mock('@dinoconfig/dinoconfig-js-sdk');

it('fetches config', async () => {
  mockConfigs.get.mockResolvedValue({
    success: true,
    data: { values: { theme: 'dark' } }
  });

  const result = await getAppConfig();
  expect(result.theme).toBe('dark');
});
```
