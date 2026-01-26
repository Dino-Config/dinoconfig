---
sidebar_position: 1
title: Getting Started
description: Learn how to install and initialize the DinoConfig JavaScript SDK in your project.
---

# Getting Started with JavaScript SDK

The DinoConfig JavaScript SDK provides a simple, type-safe way to access your configurations from any JavaScript or TypeScript application.

## Prerequisites

- Node.js 16.0.0 or higher
- npm, yarn, or pnpm
- A DinoConfig API key (get one from [dinoconfig.com](https://dinoconfig.com))

## Installation

Install the SDK using your preferred package manager:

```bash npm2yarn
npm install @dinoconfig/dinoconfig-js-sdk
```

## Quick Start

### 1. Import and Initialize

```typescript
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

// Initialize the SDK (async operation)
const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_your-api-key-here',
});
```

### 2. Fetch Configuration Values

```typescript
// Get a single value using path notation
const theme = await dinoconfig.configs.getValue('MyBrand.AppSettings.theme');
console.log(theme.data); // "dark"

// Get an entire configuration
const config = await dinoconfig.configs.get('MyBrand.AppSettings');
console.log(config.data.values); // { theme: "dark", maxItems: 100, ... }
```

### 3. Explore Available Configurations

```typescript
// List all brands you have access to
const brands = await dinoconfig.discovery.listBrands();
console.log(brands.data);

// List configurations for a brand
const configs = await dinoconfig.discovery.listConfigs('MyBrand');
console.log(configs.data);
```

## Basic Example

Here's a complete example of using the SDK:

```typescript
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

async function main() {
  // Initialize the SDK
  const dinoconfig = await dinoconfigApi({
    apiKey: process.env.DINOCONFIG_API_KEY!,
    baseUrl: 'https://api.dinoconfig.com',
  });

  try {
    // Get application settings
    const settings = await dinoconfig.configs.get('MyApp.Settings');
    
    if (settings.success) {
      console.log('App Name:', settings.data.values.appName);
      console.log('Max Users:', settings.data.values.maxUsers);
      console.log('Features:', settings.data.values.features);
    }

    // Get a specific feature flag
    const darkMode = await dinoconfig.configs.getValue<boolean>(
      'MyApp.FeatureFlags.darkModeEnabled'
    );
    
    if (darkMode.data) {
      console.log('Dark mode is enabled!');
    }
  } catch (error) {
    console.error('Error fetching config:', error);
  }
}

main();
```

## Environment Variables

We recommend storing your API key in environment variables:

```bash title=".env"
DINOCONFIG_API_KEY=dino_your-api-key-here
DINOCONFIG_BASE_URL=https://api.dinoconfig.com
```

```typescript
const dinoconfig = await dinoconfigApi({
  apiKey: process.env.DINOCONFIG_API_KEY!,
  baseUrl: process.env.DINOCONFIG_BASE_URL,
});
```

:::warning Security Note
Never commit your API keys to version control. Always use environment variables or a secrets manager in production.
:::

## SDK Structure

The SDK provides three main APIs through the initialized instance:

| API | Description |
|-----|-------------|
| `configs` | Retrieve configuration values |
| `discovery` | Explore brands, configs, and schemas |
| `cache` | Manage local caching |

```typescript
const dinoconfig = await dinoconfigApi({ apiKey: '...' });

// Access the APIs
dinoconfig.configs      // → ConfigAPI
dinoconfig.discovery    // → DiscoveryAPI  
dinoconfig.cache        // → CacheAPI
```

## What's Next?

- **[Configuration Options →](configuration)** — Customize SDK behavior
- **[Configs API →](configs-api)** — Fetch configurations and values
- **[Discovery API →](discovery-api)** — Explore available configurations
- **[Cache API →](cache-api)** — Optimize performance with caching
- **[TypeScript Integration →](typescript)** — Generate type-safe config access
