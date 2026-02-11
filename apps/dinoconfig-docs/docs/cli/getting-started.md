---
sidebar_position: 1
title: DinoConfig CLI
description: Command-line tools for DinoConfig including TypeScript and Java code generation from your configuration schemas.
keywords: [cli, codegen, javagen, typescript, java, code generation]
---

# DinoConfig CLI

The DinoConfig CLI provides command-line tools for working with your DinoConfig setup. The primary features are **TypeScript type generation** and **Java model generation** from your configuration schemas — enabling full type safety in your application code.

## Installation

```bash
# Global installation
npm install -g @dinoconfig/cli

# Or use directly with npx (no install required)
npx @dinoconfig/cli --help
```

## Commands

### Main CLI

```bash
# Show available commands
npx @dinoconfig/cli --help

# Show version
npx @dinoconfig/cli --version
```

### `codegen` — Generate TypeScript Types

Generate TypeScript type definitions from your DinoConfig schemas for full type safety in JavaScript/TypeScript projects.

```bash
# Basic usage
npx @dinoconfig/cli codegen --api-key=dino_your-api-key

# With all options
npx @dinoconfig/cli codegen \
  --api-key=dino_abc123 \
  --baseUrl=https://api.dinoconfig.com \
  --output=./src/types/dinoconfig.d.ts \
  --namespace=AppConfig
```

| Option | Description | Default |
|--------|-------------|---------|
| `--api-key=<key>` | **Required.** Your DinoConfig API key | - |
| `--baseUrl=<url>` | API base URL | `https://api.dinoconfig.com` |
| `--output=<path>` | Output file path | `./src/types/dinoconfig.d.ts` |
| `--namespace=<name>` | Root namespace name | `DinoConfig` |

### `javagen` — Generate Java Models

Generate Java POJO model classes from your DinoConfig schemas with Jackson annotations for use with the Java SDK.

```bash
# Basic usage
npx @dinoconfig/cli javagen --api-key=dino_your-api-key

# With all options
npx @dinoconfig/cli javagen \
  --api-key=dino_abc123 \
  --baseUrl=https://api.dinoconfig.com \
  --output=./src/main/java/com/example/config \
  --package=com.example.config
```

| Option | Description | Default |
|--------|-------------|---------|
| `--api-key=<key>` | **Required.** Your DinoConfig API key | - |
| `--baseUrl=<url>` | API base URL | `https://api.dinoconfig.com` |
| `--output=<path>` | Output directory path | Auto-derived |
| `--package=<pkg>` | Base package for generated classes | Auto-derived from output path |
| `--skip-deps` | Skip automatic dependency update | `false` |

## Usage with SDKs

### TypeScript / JavaScript

After generating types with `codegen`:

```typescript
import { dinoconfigApi } from '@dinoconfig/js-sdk';
import { DinoConfig } from './types/dinoconfig';

const dinoconfig = await dinoconfigApi({
  apiKey: process.env.DINOCONFIG_API_KEY!,
});

// Full type safety with generics
const flags = await dinoconfig.configs.get<DinoConfig.MyBrand.FeatureFlags>(
  'MyBrand',
  'FeatureFlags'
);

// TypeScript knows the exact types!
flags.data.values.enableDarkMode; // boolean ✓
```

### Java

After generating models with `javagen`:

```java
import com.example.config.mybrand.FeatureFlags;
import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;

DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_your-api-key");
FeatureFlags flags = sdk.getConfigAPI().getAs("MyBrand", "FeatureFlags", FeatureFlags.class);

// Full type safety!
boolean darkMode = flags.getEnableDarkMode();
int maxUpload = flags.getMaxUploadSize();
```

## CI/CD Integration

### TypeScript Projects

Add to your `package.json`:

```json
{
  "scripts": {
    "generate:types": "npx @dinoconfig/cli codegen --api-key=$DINOCONFIG_API_KEY",
    "prebuild": "npm run generate:types",
    "build": "tsc"
  }
}
```

### Java Projects (Gradle)

Add to your `build.gradle`:

```groovy
task generateConfigTypes(type: Exec) {
    commandLine 'npx', '@dinoconfig/cli', 'javagen',
        "--api-key=${System.getenv('DINOCONFIG_API_KEY')}",
        '--output=src/main/java/com/example/config'
}

compileJava.dependsOn generateConfigTypes
```

## Requirements

- **Node.js** 18 or later
- **DinoConfig API key** — get one at [dinoconfig.com](https://dinoconfig.com)

## Next Steps

- **[JavaScript SDK →](../javascript-sdk/getting-started)** — Use generated types with the JS SDK
- **[Java SDK →](../java-sdk/getting-started)** — Use generated models with the Java SDK
- **[Typed Configs →](../java-sdk/typed-configs)** — Java SDK typed configuration patterns
