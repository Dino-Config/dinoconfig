# DinoConfig CLI

[![npm version](https://img.shields.io/npm/v/@dinoconfig/cli.svg)](https://www.npmjs.com/package/@dinoconfig/cli)
[![npm downloads](https://img.shields.io/npm/dm/@dinoconfig/cli.svg)](https://www.npmjs.com/package/@dinoconfig/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

Command-line tools for DinoConfig, including **TypeScript** and **Java** code generation from your configuration schemas.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Commands](#commands)
  - [codegen - TypeScript Types](#codegen---generate-typescript-types)
  - [javagen - Java Models](#javagen---generate-java-models)
- [Programmatic API](#programmatic-api)
- [CI/CD Integration](#cicd-integration)
- [Requirements](#requirements)
- [Related Packages](#related-packages)
- [License](#license)

## Features

- **TypeScript Code Generation** - Generate type-safe TypeScript declarations from your DinoConfig schemas
- **Java Code Generation** - Generate Java POJO model classes with Jackson annotations
- **Automatic Dependency Management** - Automatically updates your `build.gradle` or `pom.xml` with required dependencies
- **Smart Package Resolution** - Auto-derives Java package names from output paths
- **Programmatic API** - Use in build scripts and custom tooling
- **Zero Configuration** - Sensible defaults for quick starts

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

---

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

#### TypeScript Options

| Option | Description | Default |
|--------|-------------|---------|
| `--api-key=<key>` | **Required.** Your DinoConfig API key | - |
| `--baseUrl=<url>` | API base URL | `http://localhost:3000` |
| `--output=<path>` | Output file path | `./src/types/dinoconfig.d.ts` |
| `--namespace=<name>` | Root namespace name | `DinoConfig` |
| `-h, --help` | Show help | - |
| `-v, --version` | Show version | - |

#### Generated TypeScript Output

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

    /** AppSettings configuration */
    export interface AppSettings {
      /** string */
      apiEndpoint: string;
      /** number */
      requestTimeout: number;
    }
  }
}
```

#### Usage with JavaScript SDK

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

---

### `javagen` - Generate Java Models

Generate Java POJO model classes from your DinoConfig schemas with Jackson annotations for JSON serialization.

```bash
# Basic usage
npx @dinoconfig/cli javagen --api-key=dino_your-api-key

# Or use the shorthand command
npx dinoconfig-javagen --api-key=dino_your-api-key

# With all options
npx @dinoconfig/cli javagen \
  --api-key=dino_abc123 \
  --baseUrl=https://api.dinoconfig.com \
  --output=./src/main/java/com/example/config \
  --package=com.example.config
```

#### Java Options

| Option | Description | Default |
|--------|-------------|---------|
| `--api-key=<key>` | **Required.** Your DinoConfig API key | - |
| `--baseUrl=<url>` | API base URL | `http://localhost:3000` |
| `--output=<path>` | Output directory path | `./libs/dinoconfig-java-sdk/lib/src/main/java/com/dinoconfig/sdk/generated` |
| `--package=<pkg>` | Base package for generated classes | Auto-derived from output path |
| `--skip-deps` | Skip automatic dependency update | `false` |
| `-h, --help` | Show help | - |
| `-v, --version` | Show version | - |

#### Package Resolution

The base package for generated classes is determined in this order:
1. **Explicit `--package` option** (if provided)
2. **Auto-derived from `--output` path** (looks for `src/main/java/` pattern)
3. **Default:** `com.dinoconfig.sdk.generated`

**Example:**
```bash
# Package auto-derived as: com.example.config
npx @dinoconfig/cli javagen \
  --api-key=dino_xxx \
  --output=./src/main/java/com/example/config
```

#### Generated Java Output

The tool generates Java POJO classes with:
- Each brand gets its own subpackage
- Each config gets its own class with typed fields
- Jackson annotations for JSON serialization
- Immutable design with final fields
- Builder pattern support

**Example generated code:**

```java
// com/example/config/mybrand/FeatureFlags.java
package com.example.config.mybrand;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/**
 * FeatureFlags configuration model.
 * Auto-generated by @dinoconfig/cli
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class FeatureFlags {

    @JsonProperty("enableDarkMode")
    private final Boolean enableDarkMode;

    @JsonProperty("maxUploadSize")
    private final Integer maxUploadSize;

    @JsonProperty("allowedCountries")
    private final List<String> allowedCountries;

    // Constructor, getters, equals, hashCode, toString...
}
```

**Generated directory structure:**

```
com/example/config/
├── mybrand/
│   ├── FeatureFlags.java
│   └── AppSettings.java
└── otherbrand/
    └── DatabaseConfig.java
```

#### Required Dependencies

Generated models require Jackson for JSON serialization. The CLI automatically adds these to your build file:

**Gradle (`build.gradle`):**
```groovy
implementation 'com.fasterxml.jackson.core:jackson-databind:2.16.1'
implementation 'com.fasterxml.jackson.core:jackson-annotations:2.16.1'
```

**Maven (`pom.xml`):**
```xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>2.16.1</version>
</dependency>
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-annotations</artifactId>
  <version>2.16.1</version>
</dependency>
```

Use `--skip-deps` to skip automatic dependency updates.

#### Usage with Java SDK

```java
import com.example.config.mybrand.FeatureFlags;
import com.dinoconfig.sdk.DinoConfigClient;

public class App {
    public static void main(String[] args) {
        DinoConfigClient client = DinoConfigClient.builder()
            .apiKey(System.getenv("DINOCONFIG_API_KEY"))
            .build();

        // Full type safety with generated models
        FeatureFlags flags = client.configs()
            .get("MyBrand", "FeatureFlags", FeatureFlags.class);

        // Java knows the exact types!
        boolean darkMode = flags.getEnableDarkMode();
        int maxUpload = flags.getMaxUploadSize();
    }
}
```

---

## Programmatic API

Use the CLI programmatically in your build scripts or custom tooling.

### Generate TypeScript Types

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
    console.log(`Generated ${result.stats?.brands} brands`);
    console.log(`Generated ${result.stats?.configs} config types`);
    console.log(`Generated ${result.stats?.keys} keys`);
    console.log(`Output: ${result.outputPath}`);
  } else {
    console.error('Failed:', result.error);
  }
}
```

### Generate Java Models

```typescript
import { generateJavaModels } from '@dinoconfig/cli';

async function generateConfigModels() {
  const result = await generateJavaModels({
    apiKey: process.env.DINOCONFIG_API_KEY!,
    baseUrl: 'https://api.dinoconfig.com',
    output: './src/main/java/com/example/config',
    package: 'com.example.config', // optional
    skipDependencyUpdate: false,
  });

  if (result.success) {
    console.log(`Generated ${result.stats?.brands} brands`);
    console.log(`Generated ${result.stats?.configs} config models`);
    console.log(`Base package: ${result.basePackage}`);
    console.log(`Files: ${result.generatedFiles?.join(', ')}`);
    
    // Check dependency update status
    if (result.dependencyUpdate?.addedDependencies?.length) {
      console.log('Dependencies added:', result.dependencyUpdate.addedDependencies);
    }
  } else {
    console.error('Failed:', result.error);
  }
}
```

### Advanced: Direct Generator Usage

```typescript
import { TypeGenerator, JavaModelGenerator, derivePackageFromPath } from '@dinoconfig/cli';
import { dinoconfigApi } from '@dinoconfig/js-sdk';

// Get introspection data
const dinoconfig = await dinoconfigApi({ apiKey: 'dino_xxx' });
const { data } = await dinoconfig.discovery.introspect();

// Generate TypeScript
const tsGenerator = new TypeGenerator('MyNamespace');
const tsContent = tsGenerator.generate(data);

// Generate Java
const javaGenerator = new JavaModelGenerator({ basePackage: 'com.example' });
const javaFiles = javaGenerator.generate(data); // Map<string, string>
```

---

## CI/CD Integration

### TypeScript Projects

**package.json:**
```json
{
  "scripts": {
    "generate:types": "dinoconfig-codegen --api-key=$DINOCONFIG_API_KEY",
    "prebuild": "npm run generate:types",
    "build": "tsc"
  }
}
```

### Java Projects (Gradle)

**build.gradle:**
```groovy
task generateConfigTypes(type: Exec) {
    commandLine 'npx', '@dinoconfig/cli', 'javagen',
        "--api-key=${System.getenv('DINOCONFIG_API_KEY')}",
        '--output=src/main/java/com/example/config'
}

compileJava.dependsOn generateConfigTypes
```

### Java Projects (Maven)

**pom.xml:**
```xml
<plugin>
  <groupId>org.codehaus.mojo</groupId>
  <artifactId>exec-maven-plugin</artifactId>
  <version>3.1.0</version>
  <executions>
    <execution>
      <id>generate-config-types</id>
      <phase>generate-sources</phase>
      <goals>
        <goal>exec</goal>
      </goals>
      <configuration>
        <executable>npx</executable>
        <arguments>
          <argument>@dinoconfig/cli</argument>
          <argument>javagen</argument>
          <argument>--api-key=${env.DINOCONFIG_API_KEY}</argument>
          <argument>--output=src/main/java/com/example/config</argument>
        </arguments>
      </configuration>
    </execution>
  </executions>
</plugin>
```

### GitHub Actions

```yaml
name: Build

on: [push, pull_request]

jobs:
  build-typescript:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Generate DinoConfig Types
        run: npx @dinoconfig/cli codegen --api-key=${{ secrets.DINOCONFIG_API_KEY }}
      
      - name: Build
        run: npm run build

  build-java:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Generate DinoConfig Java Models
        run: npx @dinoconfig/cli javagen --api-key=${{ secrets.DINOCONFIG_API_KEY }} --output=src/main/java/com/example/config
      
      - name: Build with Gradle
        run: ./gradlew build
```

---

## Requirements

- **Node.js** >= 18.0.0
- **DinoConfig API key** (get one at [dinoconfig.com](https://dinoconfig.com))

For Java generation:
- **Java** >= 11 (for running generated code)
- **Gradle** or **Maven** (for dependency management)

---

## Related Packages

| Package | Description |
|---------|-------------|
| [@dinoconfig/js-sdk](https://www.npmjs.com/package/@dinoconfig/js-sdk) | JavaScript/TypeScript SDK for DinoConfig API |
| [dinoconfig-java-sdk](https://search.maven.org/artifact/com.dinoconfig/dinoconfig-java-sdk) | Java SDK for DinoConfig API |

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with 🦖 by the DinoConfig Team
