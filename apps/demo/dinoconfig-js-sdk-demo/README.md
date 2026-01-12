# DinoConfig JavaScript SDK Demo

This demo project showcases how to use the DinoConfig JavaScript SDK in your application.

## Overview

This demo application demonstrates:
- How to initialize the DinoConfig SDK
- How to use the Discovery API to explore available brands and configurations
- How to retrieve configuration values using the SDK
- How to handle responses and errors

## Project Structure

```
apps/demo/dinoconfig-js-sdk-demo/
├── src/
│   └── index.ts               # Main demo application
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── project.json              # Nx project configuration
└── README.md                 # This file
```

## Installation

First, install the dependencies:

```bash
cd apps/demo/dinoconfig-js-sdk-demo
npm install
```

## Building the Project

### Using npm

```bash
npm run build
```

### Using Nx

```bash
nx build dinoconfig-js-sdk-demo
```

## Running the Demo

### With npm (development mode using tsx)

```bash
# With default base URL
npm run dev -- --api-key=dino_your-api-key-here

# With custom base URL
npm run dev -- --api-key=dino_your-api-key-here --baseUrl=https://api.dinoconfig.com
```

### With compiled JavaScript

```bash
# Build first
npm run build

# Then run
npm start -- --api-key=dino_your-api-key-here

# With custom base URL
npm start -- --api-key=dino_your-api-key-here --baseUrl=https://api.dinoconfig.com
```

### Using Nx

```bash
# Note: Nx will run the 'serve' target which executes 'npm run dev'
# You'll need to pass arguments through the npm script
nx serve dinoconfig-js-sdk-demo
```

## Usage Example

```typescript
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

// Initialize SDK with single factory function
const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_your-api-key-here',
  baseUrl: 'https://api.dinoconfig.com',
  timeout: 10000,
});

// Discovery API - List all brands
const brands = await dinoconfig.discovery.listBrands();
console.log('Available brands:', brands.data);

// Discovery API - List configs for a brand
const configs = await dinoconfig.discovery.listConfigs('MyBrand');
console.log('Configs:', configs.data);

// Discovery API - Get config schema
const schema = await dinoconfig.discovery.getSchema('MyBrand', 'MyConfig');
console.log('Schema fields:', Object.keys(schema.data.fields));

// Discovery API - Full introspection
const introspection = await dinoconfig.discovery.introspect();
console.log('All data:', introspection.data);

// Configs API - Get a specific configuration value
const response = await dinoconfig.configs.getConfigValue(
  'MyBrand',
  'MyConfig',
  'myKey'
);

if (response.success) {
  console.log('Config value:', response.data);
}
```

## Demo Features

The demo application includes:

1. **SDK Initialization** - Shows how to create and configure the SDK using the factory function
2. **Discovery API** - Demonstrates how to discover brands, configs, and schemas
3. **Introspection** - Shows full introspection of all available configurations
4. **Configuration Value Retrieval** - Demonstrates how to retrieve configuration values
5. **Error Handling** - Demonstrates proper error handling patterns

## API Methods Available

### Discovery API
- `discovery.listBrands()` - List all brands accessible by your API key
- `discovery.listConfigs(brandName)` - List all configs for a specific brand
- `discovery.getSchema(brandName, configName)` - Get the schema for a configuration
- `discovery.introspect()` - Get full introspection of all brands, configs, and keys

### Configs API
- `configs.getConfigValue(brandName, configName, configValueKey, options?)` - Get a specific configuration value

## TypeScript Support

This demo is written in TypeScript and includes full type definitions. The SDK provides comprehensive type information for all methods and data structures.

## Dependencies

This demo project depends on:
- The DinoConfig JavaScript SDK (referenced as a workspace dependency)
- TypeScript 5.3.0+
- Node.js 20+
- tsx (for development - a fast TypeScript runner)

## Environment Setup

Make sure you have:
- Node.js v20 or higher installed
- npm or yarn package manager
- A valid DinoConfig API key

## Troubleshooting

### Module Resolution Issues

If you encounter module resolution issues, make sure:
1. The JS SDK has been built: `nx build dinoconfig-js-sdk`
2. Dependencies are installed: `npm install` in the demo directory

### API Connection Issues

If you can't connect to the API:
1. Verify your API key is correct
2. Check that the base URL is accessible
3. Ensure you have network connectivity

## See Also

- [DinoConfig JavaScript SDK README](../../../libs/dinoconfig-js-sdk/README.md)
- [DinoConfig Java SDK Demo](../dinoconfig-java-sdk-demo/README.md)
- [DinoConfig Documentation](https://docs.dinoconfig.com)

