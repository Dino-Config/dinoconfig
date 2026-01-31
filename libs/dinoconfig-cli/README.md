# DinoConfig CLI

[![npm version](https://img.shields.io/npm/v/@dinoconfig/cli.svg)](https://www.npmjs.com/package/@dinoconfig/cli)
[![npm downloads](https://img.shields.io/npm/dm/@dinoconfig/cli.svg)](https://www.npmjs.com/package/@dinoconfig/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

Command-line tools for DinoConfig, including TypeScript and Java code generation from your configuration schemas.

## Installation

```bash
# npm
npm install -g @dinoconfig/cli

# npx (no install required)
npx @dinoconfig/cli codegen --api-key=dino_xxx
```

## Commands

### `codegen` - Generate TypeScript Types

Generate TypeScript type definitions from your DinoConfig schemas for full type safety.

```bash
# Basic usage
npx @dinoconfig/cli codegen --api-key=dino_your-api-key

# Or use the shorthand command
npx dinoconfig-codegen --api-key=dino_your-api-key

# With all options
npx @dinoconfig/cli codegen \
  --api-key=dino_abc123 \
  --baseUrl=https://api.dinoconfig.com \
  --output=./src/types/dinoconfig.d.ts \
  --namespace=AppConfig
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--api-key=<key>` | **Required.** Your DinoConfig API key | - |
| `--baseUrl=<url>` | API base URL | `http://localhost:3000` |
| `--output=<path>` | Output file path | `./src/types/dinoconfig.d.ts` |
| `--namespace=<name>` | Root namespace name | `DinoConfig` |
| `-h, --help` | Show help | - |
| `-v, --version` | Show version | - |

#### Generated Output

The tool generates a TypeScript declaration file with:
- A namespace for each brand
- An interface for each config
- Typed properties for each config key

**Example generated code:**

```typescript
// src/types/dinoconfig.d.ts
export namespace DinoConfig {
  export namespace MyBrand {
    /** FeatureFlags configuration */
    export interface FeatureFlags {
      /** boolean */
      enableDarkMode: boolean;
      /** number */
      maxUploadSize: number;
      /** string[] */
      allowedCountries: string[];
    }
  }
}
```

#### Usage with SDK

```typescript
import { dinoconfigApi } from '@dinoconfig/js-sdk';
import { DinoConfig } from './types/dinoconfig';

const dinoconfig = await dinoconfigApi({
  apiKey: process.env.DINOCONFIG_API_KEY!
});

// Full type safety with generics
const flags = await dinoconfig.configs.get<DinoConfig.MyBrand.FeatureFlags>(
  'MyBrand',
  'FeatureFlags'
);

// TypeScript knows the exact types!
flags.data.values.enableDarkMode; // boolean ✓
flags.data.values.maxUploadSize;  // number ✓
```

## Programmatic API

You can also use the CLI programmatically in your build scripts:

```typescript
import { generateTypes } from '@dinoconfig/cli';

async function generateConfigTypes() {
  const result = await generateTypes({
    apiKey: process.env.DINOCONFIG_API_KEY!,
    baseUrl: 'https://api.dinoconfig.com',
    output: './src/types/dinoconfig.d.ts',
    namespace: 'DinoConfig',
  });

  if (result.success) {
    console.log(`Generated ${result.stats.configs} config types`);
  } else {
    console.error('Failed:', result.error);
  }
}
```

## CI/CD Integration

Add type generation to your build process:

```json
{
  "scripts": {
    "generate:types": "dinoconfig-codegen --api-key=$DINOCONFIG_API_KEY",
    "build": "npm run generate:types && tsc"
  }
}
```

### GitHub Actions Example

```yaml
- name: Generate DinoConfig Types
  run: npx @dinoconfig/cli codegen --api-key=${{ secrets.DINOCONFIG_API_KEY }}
```

## Requirements

- Node.js >= 18.0.0
- DinoConfig API key

## Related Packages

- [@dinoconfig/js-sdk](https://www.npmjs.com/package/@dinoconfig/js-sdk) - JavaScript/TypeScript SDK

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with ❤️ by the DinoConfig Team
