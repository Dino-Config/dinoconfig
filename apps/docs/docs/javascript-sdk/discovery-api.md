---
sidebar_position: 4
title: Discovery API Reference
description: Explore and introspect your DinoConfig brands, configurations, and schemas using the Discovery API. List brands, configs, and get schemas.
keywords: [discovery api, list brands, list configs, get schema, introspection, javascript sdk api]
---

# Discovery API

The Discovery API allows you to explore and introspect your DinoConfig setup. Use it to list brands, discover configurations, examine schemas, and perform full introspection.

## Overview

Access the Discovery API through your initialized SDK instance:

```typescript
const dinoconfig = await dinoconfigApi({ apiKey: '...' });
const discoveryApi = dinoconfig.discovery;
```

## Methods

### `listBrands()` — List All Brands

Returns all brands accessible with your API key.

#### Signature

```typescript
listBrands(options?: RequestOptions): Promise<ApiResponse<BrandInfo[]>>
```

#### Returns

```typescript
interface BrandInfo {
  name: string;
  description?: string;
  configCount: number;
  createdAt: Date;
}
```

#### Example

```typescript
const brands = await dinoconfig.discovery.listBrands();

if (brands.success) {
  brands.data.forEach(brand => {
    console.log(`${brand.name}: ${brand.configCount} configurations`);
    console.log(`  Description: ${brand.description || 'N/A'}`);
    console.log(`  Created: ${brand.createdAt}`);
  });
}
```

**Output:**
```
MyApp: 5 configurations
  Description: Main application settings
  Created: 2024-01-15T10:30:00.000Z
FeatureFlags: 2 configurations
  Description: Feature toggle configurations
  Created: 2024-02-20T14:45:00.000Z
```

---

### `listConfigs()` — List Configurations for a Brand

Returns all configurations within a specific brand.

#### Signature

```typescript
listConfigs(brandName: string, options?: RequestOptions): Promise<ApiResponse<ConfigInfo[]>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brandName` | `string` | Yes | The brand name to list configs for |
| `options` | `RequestOptions` | No | Request customization |

#### Returns

```typescript
interface ConfigInfo {
  name: string;
  description?: string;
  keys: readonly string[];
  version: number;
  createdAt: Date;
}
```

#### Example

```typescript
const configs = await dinoconfig.discovery.listConfigs('MyApp');

if (configs.success) {
  configs.data.forEach(config => {
    console.log(`📁 ${config.name} (v${config.version})`);
    console.log(`   Keys: ${config.keys.join(', ')}`);
  });
}
```

**Output:**
```
📁 Settings (v3)
   Keys: theme, maxItems, features, apiEndpoint
📁 Database (v1)
   Keys: host, port, name, poolSize
📁 Authentication (v2)
   Keys: provider, clientId, scopes, redirectUri
```

---

### `getSchema()` — Get Configuration Schema

Returns the schema definition for a specific configuration, including field types and validation rules.

#### Signature

```typescript
getSchema(
  brandName: string, 
  configName: string, 
  options?: RequestOptions
): Promise<ApiResponse<ConfigSchema>>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brandName` | `string` | Yes | The brand name |
| `configName` | `string` | Yes | The configuration name |
| `options` | `RequestOptions` | No | Request customization |

#### Returns

```typescript
interface ConfigSchema {
  configName: string;
  version: number;
  fields: Readonly<Record<string, FieldSchema>>;
}

interface FieldSchema {
  type: FieldType;           // 'string' | 'number' | 'boolean' | 'object' | 'array'
  description?: string;
  defaultValue?: unknown;
  required?: boolean;
  validation?: FieldValidation;
}

interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  enum?: unknown[];
}
```

#### Example

```typescript
const schema = await dinoconfig.discovery.getSchema('MyApp', 'Settings');

if (schema.success) {
  console.log(`Schema for ${schema.data.configName} (v${schema.data.version}):`);
  
  Object.entries(schema.data.fields).forEach(([key, field]) => {
    console.log(`\n  ${key}:`);
    console.log(`    Type: ${field.type}`);
    console.log(`    Required: ${field.required ?? false}`);
    if (field.description) {
      console.log(`    Description: ${field.description}`);
    }
    if (field.defaultValue !== undefined) {
      console.log(`    Default: ${JSON.stringify(field.defaultValue)}`);
    }
    if (field.validation) {
      console.log(`    Validation: ${JSON.stringify(field.validation)}`);
    }
  });
}
```

**Output:**
```
Schema for Settings (v3):

  theme:
    Type: string
    Required: true
    Description: Application color theme
    Default: "light"
    Validation: {"enum":["light","dark","system"]}

  maxItems:
    Type: number
    Required: false
    Description: Maximum items per page
    Default: 50
    Validation: {"min":10,"max":100}

  features:
    Type: array
    Required: false
    Description: Enabled feature flags
    Default: []
```

---

### `introspect()` — Full Introspection

Performs a complete introspection of all brands, configurations, and keys accessible with your API key.

#### Signature

```typescript
introspect(options?: RequestOptions): Promise<ApiResponse<IntrospectionResult>>
```

#### Returns

```typescript
interface IntrospectionResult {
  company: string;
  brands: readonly BrandInfoDetail[];
  generatedAt: Date;
}

interface BrandInfoDetail {
  name: string;
  description?: string;
  configs: readonly ConfigInfoDetail[];
}

interface ConfigInfoDetail {
  name: string;
  description?: string;
  version: number;
  keys: readonly KeyInfo[];
}

interface KeyInfo {
  name: string;
  type: FieldType;
  description?: string;
}
```

#### Example

```typescript
const result = await dinoconfig.discovery.introspect();

if (result.success) {
  const { company, brands, generatedAt } = result.data;
  
  console.log(`\n🏢 ${company}`);
  console.log(`Generated at: ${generatedAt}\n`);
  
  brands.forEach(brand => {
    console.log(`📦 ${brand.name}`);
    
    brand.configs.forEach(config => {
      console.log(`  📁 ${config.name} (v${config.version})`);
      
      config.keys.forEach(key => {
        console.log(`    • ${key.name}: ${key.type}`);
      });
    });
    
    console.log();
  });
}
```

**Output:**
```
🏢 Acme Corporation
Generated at: 2024-03-15T10:30:00.000Z

📦 MyApp
  📁 Settings (v3)
    • theme: string
    • maxItems: number
    • features: array
  📁 Database (v1)
    • host: string
    • port: number
    • name: string

📦 FeatureFlags
  📁 Web (v2)
    • darkMode: boolean
    • newDashboard: boolean
    • betaFeatures: object
```

## Use Cases

### Dynamic Configuration Loading

Use discovery to dynamically load configurations at runtime:

```typescript
async function loadAllConfigs() {
  const configs: Record<string, Record<string, unknown>> = {};
  
  const brands = await dinoconfig.discovery.listBrands();
  
  for (const brand of brands.data) {
    const brandConfigs = await dinoconfig.discovery.listConfigs(brand.name);
    
    for (const configInfo of brandConfigs.data) {
      const config = await dinoconfig.configs.get(
        `${brand.name}.${configInfo.name}`
      );
      
      configs[`${brand.name}.${configInfo.name}`] = config.data.values;
    }
  }
  
  return configs;
}
```

### Configuration Validation

Use schemas to validate configuration values:

```typescript
async function validateConfig(brandName: string, configName: string, values: Record<string, unknown>) {
  const schema = await dinoconfig.discovery.getSchema(brandName, configName);
  const errors: string[] = [];
  
  for (const [key, field] of Object.entries(schema.data.fields)) {
    const value = values[key];
    
    // Check required fields
    if (field.required && value === undefined) {
      errors.push(`Missing required field: ${key}`);
      continue;
    }
    
    // Check type
    if (value !== undefined && typeof value !== field.type) {
      errors.push(`Invalid type for ${key}: expected ${field.type}`);
    }
    
    // Check validation rules
    if (field.validation?.enum && !field.validation.enum.includes(value)) {
      errors.push(`Invalid value for ${key}: must be one of ${field.validation.enum.join(', ')}`);
    }
  }
  
  return errors;
}
```

### Generate Documentation

Auto-generate documentation from schemas:

```typescript
async function generateDocs(brandName: string) {
  const configs = await dinoconfig.discovery.listConfigs(brandName);
  let markdown = `# ${brandName} Configuration\n\n`;
  
  for (const configInfo of configs.data) {
    const schema = await dinoconfig.discovery.getSchema(brandName, configInfo.name);
    
    markdown += `## ${configInfo.name}\n\n`;
    markdown += `${configInfo.description || ''}\n\n`;
    markdown += `| Key | Type | Required | Description |\n`;
    markdown += `|-----|------|----------|-------------|\n`;
    
    for (const [key, field] of Object.entries(schema.data.fields)) {
      markdown += `| ${key} | ${field.type} | ${field.required ? 'Yes' : 'No'} | ${field.description || '-'} |\n`;
    }
    
    markdown += '\n';
  }
  
  return markdown;
}
```

## Best Practices

### 1. Cache Discovery Results

Discovery data changes infrequently—cache it aggressively:

```typescript
// Cache introspection for 1 hour
const result = await dinoconfig.discovery.introspect({
  ttl: 3600000,
});
```

### 2. Use Introspection for Initial Load

For applications that need all configs, use `introspect()` to get everything in one call:

```typescript
// ✅ Single call for everything
const all = await dinoconfig.discovery.introspect();

// ❌ Multiple calls (slower)
const brands = await dinoconfig.discovery.listBrands();
for (const brand of brands.data) {
  const configs = await dinoconfig.discovery.listConfigs(brand.name);
  // ...
}
```

### 3. Handle Permissions Gracefully

Your API key may not have access to all brands:

```typescript
const brands = await dinoconfig.discovery.listBrands();

// Only shows brands your key can access
console.log(`You have access to ${brands.data.length} brands`);
```

## Next Steps

- **[Cache API →](cache-api)** — Optimize performance with caching
- **[TypeScript →](typescript)** — Generate type-safe configurations
- **[Examples →](examples)** — Real-world usage patterns
