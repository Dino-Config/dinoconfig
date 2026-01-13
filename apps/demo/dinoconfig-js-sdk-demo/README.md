# DinoConfig JavaScript SDK Demo

This demo project showcases how to use the DinoConfig JavaScript SDK in your application.

## Overview

This demo application demonstrates:

- How to initialize the DinoConfig SDK using the factory function
- How to use the **Configs API** to retrieve entire configs and single values
- How to use the **Discovery API** to explore brands, configs, and schemas
- How to handle responses and errors properly
- Best practices for SDK usage

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

```bash
cd apps/demo/dinoconfig-js-sdk-demo
npm install
```

## Building the Project

```bash
# Using npm
npm run build

# Using Nx
npx nx build dinoconfig-js-sdk-demo
```

## Running the Demo

### Development Mode (tsx)

```bash
# With default base URL (http://localhost:3000)
npm run dev -- --api-key=dino_your-api-key-here

# With custom base URL
npm run dev -- --api-key=dino_your-api-key-here --baseUrl=https://api.dinoconfig.com
```

### Production Mode

```bash
# Build first
npm run build

# Run
npm start -- --api-key=dino_your-api-key-here

# With custom base URL
npm start -- --api-key=dino_your-api-key-here --baseUrl=https://api.dinoconfig.com
```

## Configuration

The demo uses constants that can be modified in `src/index.ts`:

```typescript
// Demo configuration - change these to match your setup
const DEMO_BRAND = 'DemoBrand';
const DEMO_CONFIG = 'MyConfig';
const DEMO_KEY = 'test';
```

## API Methods Demonstrated

### Configs API

| Method | Description |
|--------|-------------|
| `configs.get(path)` | Get entire config using shorthand path |
| `configs.get(brand, config)` | Get entire config with full parameters |
| `configs.getValue(path)` | Get single value using shorthand path |
| `configs.getValue(brand, config, key)` | Get single value with full parameters |

### Discovery API

| Method | Description |
|--------|-------------|
| `discovery.listBrands()` | List all accessible brands |
| `discovery.listConfigs(brand)` | List all configs for a brand |
| `discovery.getSchema(brand, config)` | Get config schema with field types |
| `discovery.introspect()` | Full introspection of all data |

## Usage Examples

### Initialize SDK

```typescript
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

const dinoconfig = await dinoconfigApi({
  apiKey: 'dino_your-api-key-here',
  baseUrl: 'https://api.dinoconfig.com',
  timeout: 10000,
});
```

### Get Entire Config

```typescript
// Shorthand path
const config = await dinoconfig.configs.get('Brand.Config');
console.log('Values:', config.data.values);
console.log('Version:', config.data.version);
console.log('Keys:', config.data.keys);

// Full parameters
const config = await dinoconfig.configs.get('Brand', 'Config');
```

### Get Single Value

```typescript
// Shorthand path (recommended for readability)
const response = await dinoconfig.configs.getValue('Brand.Config.Key');
console.log('Value:', response.data);

// Full parameters
const response = await dinoconfig.configs.getValue('Brand', 'Config', 'Key');
```

### Discovery

```typescript
// List brands
const brands = await dinoconfig.discovery.listBrands();
brands.data.forEach(brand => {
  console.log(`${brand.name}: ${brand.configCount} configs`);
});

// List configs for a brand
const configs = await dinoconfig.discovery.listConfigs('Brand');
configs.data.forEach(config => {
  console.log(`${config.name} (v${config.version})`);
});

// Get schema
const schema = await dinoconfig.discovery.getSchema('Brand', 'Config');
Object.entries(schema.data.fields).forEach(([name, field]) => {
  console.log(`${name}: ${field.type}`);
});

// Full introspection
const all = await dinoconfig.discovery.introspect();
console.log(`Company: ${all.data.company}`);
console.log(`Brands: ${all.data.brands.length}`);
```

## Demo Output

When you run the demo, it will:

1. Initialize the SDK and show configuration info
2. List available API methods
3. Demo each Discovery API method:
   - List brands
   - List configs for a brand
   - Get config schema
   - Full introspection
4. Demo each Configs API method:
   - Get entire config (both shorthand and full params)
   - Get single value (both shorthand and full params)
5. Show example usage patterns
6. Display completion instructions

## Error Handling

The demo includes proper error handling:

```typescript
try {
  const response = await dinoconfig.configs.getValue('Brand.Config.Key');
  if (response.success) {
    console.log('Value:', response.data);
  } else {
    console.log('Failed:', response.message);
  }
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

## TypeScript Support

The demo is fully typed. Available imports:

```typescript
import {
  dinoconfigApi,
  DinoConfigInstance,
  ConfigData,
  BrandInfo,
  ConfigInfo,
  FieldSchema,
  KeyInfo,
  ConfigInfoDetail,
  BrandInfoDetail,
} from '@dinoconfig/dinoconfig-js-sdk';
```

## Dependencies

- DinoConfig JavaScript SDK (workspace dependency)
- TypeScript 5.3.0+
- Node.js 20+
- tsx (for development)

## Troubleshooting

### Module Resolution Issues

```bash
# Ensure SDK is built first
npx nx build dinoconfig-js-sdk

# Install dependencies
npm install
```

### API Connection Issues

1. Verify your API key is correct
2. Check the base URL is accessible
3. Ensure network connectivity
4. Check for CORS issues if running in browser

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid path format` | Wrong dot-notation | Use `"Brand.Config"` or `"Brand.Config.Key"` |
| `401 Unauthorized` | Invalid API key | Check your API key |
| `404 Not Found` | Resource doesn't exist | Verify brand/config/key names |

## See Also

- [DinoConfig JavaScript SDK README](../../../libs/dinoconfig-js-sdk/README.md)
- [DinoConfig Java SDK Demo](../dinoconfig-java-sdk-demo/README.md)
- [DinoConfig Documentation](https://docs.dinoconfig.com)
