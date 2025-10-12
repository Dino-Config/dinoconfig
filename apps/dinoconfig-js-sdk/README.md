# DinoConfig JavaScript SDK

Official JavaScript/TypeScript SDK for the DinoConfig API. This SDK provides a simple and intuitive way to interact with DinoConfig's configuration management system.

## Installation

```bash
npm install @dinoconfig/dinoconfig-js-sdk
```

## Quick Start

```typescript
import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

// Initialize the SDK
const dinoconfig = dinoconfigApi({
  token: 'your-api-token-here',
  baseUrl: 'https://api.dinoconfig.com', // optional
  company: 'your-company-id', // optional
  apiVersion: 'v1', // optional
  timeout: 10000 // optional
});

// Get all configurations for a brand
const configs = await dinoconfig.configs.getAllConfigs(123);

// Get a specific configuration
const config = await dinoconfig.configs.getConfig(123, 456);

// Create a new configuration
const newConfig = await dinoconfig.configs.createConfig(123, {
  name: 'My Config',
  description: 'A sample configuration',
  formData: {
    theme: 'dark',
    language: 'en'
  }
});
```

## Configuration Options

The `dinoconfigApi` function accepts the following configuration options:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `token` | `string` | ✅ | - | Your API authentication token |
| `baseUrl` | `string` | ❌ | `'https://api.dinoconfig.com'` | Base URL for the DinoConfig API |
| `company` | `string` | ❌ | - | Company identifier for multi-tenant support |
| `apiVersion` | `string` | ❌ | `'v1'` | API version to use |
| `timeout` | `number` | ❌ | `10000` | Request timeout in milliseconds |

## API Methods

### Configuration Management

#### `dinoconfig.configs.getAllConfigs(brandId, options?)`
Get all configurations for a specific brand.

#### `dinoconfig.configs.getConfig(brandId, configId, options?)`
Get a specific configuration by ID.

#### `dinoconfig.configs.createConfig(brandId, configData, options?)`
Create a new configuration.

#### `dinoconfig.configs.updateConfig(brandId, configId, configData, options?)`
Update an existing configuration.

#### `dinoconfig.configs.deleteConfig(brandId, configId, options?)`
Delete a configuration.

#### `dinoconfig.configs.getConfigByName(brandId, configName, options?)`
Get a configuration by name (helper method).

#### `dinoconfig.configs.getConfigsByCompany(brandId, company, options?)`
Get configurations filtered by company (helper method).

### Utility Methods

#### `dinoconfig.testConnection(options?)`
Test the connection to the API.

#### `dinoconfig.setToken(token)`
Update the authentication token.

#### `dinoconfig.setHeader(key, value)`
Set a custom header for all requests.

#### `dinoconfig.removeHeader(key)`
Remove a custom header.

## Data Types

### Config Object
```typescript
interface Config {
  id: number;
  name: string;
  description?: string;
  company?: string;
  formData: Record<string, any>;
  schema?: Record<string, any>;
  uiSchema?: Record<string, any>;
  version: number;
  createdAt: Date;
  brand: {
    id: number;
    name: string;
  };
}
```

### CreateConfigDto
```typescript
interface CreateConfigDto {
  name: string;
  description?: string;
  formData: Record<string, any>;
  schema?: Record<string, any>;
  uiSchema?: Record<string, any>;
}
```

## Error Handling

The SDK throws structured errors with the following format:

```typescript
interface ApiError {
  message: string;
  status: number;
  code?: string;
}
```

Example error handling:

```typescript
try {
  const config = await dinoconfig.configs.getConfig(123, 456);
} catch (error) {
  if (error.status === 404) {
    console.log('Configuration not found');
  } else if (error.status === 401) {
    console.log('Unauthorized - check your token');
  } else {
    console.log('Unexpected error:', error.message);
  }
}
```

## Advanced Usage

### Custom Headers and Options

```typescript
// Set custom headers globally
dinoconfig.setHeader('X-Custom-Header', 'custom-value');

// Use custom options for specific requests
const configs = await dinoconfig.configs.getAllConfigs(123, {
  timeout: 5000,
  retries: 2,
  headers: {
    'X-Custom-Request-Header': 'request-specific-value'
  }
});
```

### Dynamic Token Updates

```typescript
// Update token dynamically
dinoconfig.setToken('new-token-here');
```

## Development

### Building

```bash
nx build dinoconfig-js-sdk
```

### Testing

```bash
nx test dinoconfig-js-sdk
```

## License

MIT
