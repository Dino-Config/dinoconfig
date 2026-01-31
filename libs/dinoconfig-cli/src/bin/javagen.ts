/**
 * DinoConfig Java Model Generator CLI
 *
 * Generates Java POJO model classes from DinoConfig schemas.
 *
 * @example
 * ```bash
 * npx @dinoconfig/cli javagen --api-key=dino_xxx --output=./libs/dinoconfig-java-sdk/lib/src/main/java
 * ```
 */

import { generateJavaModels } from '../lib/codegen';
import {
  CLI_NAME,
  CLI_VERSION,
  DEFAULT_BASE_URL,
} from '../lib/constants';

const DEFAULT_JAVA_OUTPUT = './libs/dinoconfig-java-sdk/lib/src/main/java/com/dinoconfig/sdk/generated';

interface CliOptions {
  apiKey?: string;
  baseUrl?: string;
  output?: string;
  package?: string;
  help?: boolean;
  version?: boolean;
  skipDeps?: boolean;
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {};

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--version' || arg === '-v') {
      options.version = true;
    } else if (arg.startsWith('--api-key=')) {
      options.apiKey = arg.slice('--api-key='.length);
    } else if (arg.startsWith('--baseUrl=') || arg.startsWith('--base-url=')) {
      options.baseUrl = arg.split('=')[1];
    } else if (arg.startsWith('--output=') || arg.startsWith('-o=')) {
      options.output = arg.split('=')[1];
    } else if (arg.startsWith('--package=') || arg.startsWith('-p=')) {
      options.package = arg.split('=')[1];
    } else if (arg === '--skip-deps' || arg === '--no-deps') {
      options.skipDeps = true;
    }
  }

  return options;
}

function showUsage(): void {
  console.log(`
DinoConfig Java Model Generator v${CLI_VERSION}

Generate Java POJO model classes from DinoConfig schemas.

USAGE:
  npx ${CLI_NAME} javagen --api-key=<key> [options]

OPTIONS:
  --api-key=<key>       Required. Your DinoConfig API key
  --baseUrl=<url>       API base URL (default: ${DEFAULT_BASE_URL})
  --output=<path>       Output directory path (default: ${DEFAULT_JAVA_OUTPUT})
  --package=<pkg>       Base package for generated classes (auto-derived from output path)
  --skip-deps           Skip automatic dependency update in build file
  -h, --help            Show this help message
  -v, --version         Show version number

EXAMPLES:
  # Generate Java models with default settings
  npx ${CLI_NAME} javagen --api-key=dino_abc123

  # Generate Java models to custom path (package auto-derived from path)
  npx ${CLI_NAME} javagen --api-key=dino_abc123 --output=./src/main/java/org/example/models
  # This will use package: org.example.models

  # Generate with explicit package
  npx ${CLI_NAME} javagen --api-key=dino_abc123 --output=./src/main/java/org/example/models --package=org.example.config

  # Skip automatic dependency updates
  npx ${CLI_NAME} javagen --api-key=dino_abc123 --skip-deps

PACKAGE RESOLUTION:
  The base package for generated classes is determined in this order:
  1. Explicit --package option (if provided)
  2. Auto-derived from --output path (looks for src/main/java/ pattern)
  3. Default: com.dinoconfig.sdk.generated

GENERATED OUTPUT:
  The tool generates Java POJO classes:
  - Each brand gets its own subpackage
  - Each config gets its own class with typed fields
  - Classes follow Java best practices (immutable, Jackson annotations, etc.)
  - Automatically adds Jackson dependency to your build.gradle or pom.xml

  Example with --output=./src/main/java/org/example/models:
    org/example/models/
      mybrand/
        FeatureFlags.java    (package org.example.models.mybrand)
        AppSettings.java

DEPENDENCIES:
  Generated models require Jackson for JSON serialization:
  
  Gradle:
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.16.1'
    implementation 'com.fasterxml.jackson.core:jackson-annotations:2.16.1'
  
  Maven:
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.16.1</version>
    </dependency>
`);
}

function logConfig(baseUrl: string, output: string, pkg?: string): void {
  console.log(`\n🦖 DinoConfig Java Model Generator v${CLI_VERSION}\n`);
  console.log(`  Base URL:  ${baseUrl}`);
  console.log(`  Output:    ${output}`);
  if (pkg) {
    console.log(`  Package:   ${pkg} (explicit)`);
  } else {
    console.log(`  Package:   (auto-derived from output path)`);
  }
  console.log('');
}

interface DependencyUpdateResult {
  success: boolean;
  projectType?: 'gradle' | 'maven' | 'unknown';
  buildFilePath?: string;
  addedDependencies?: string[];
  existingDependencies?: string[];
  error?: string;
  warnings?: string[];
}

function logSuccess(
  output: string,
  stats?: { brands: number; configs: number; keys: number },
  depUpdate?: DependencyUpdateResult,
  basePackage?: string
): void {
  console.log('\n✅ Java models generated successfully!\n');
  if (stats) {
    console.log(`  Generated ${stats.brands} brand(s)`);
    console.log(`  Generated ${stats.configs} config class(es) with ${stats.keys} field(s)`);
  }
  console.log(`  Output directory: ${output}`);
  if (basePackage) {
    console.log(`  Base package: ${basePackage}`);
  }

  // Show dependency update results
  if (depUpdate) {
    console.log('');
    if (depUpdate.success && depUpdate.addedDependencies && depUpdate.addedDependencies.length > 0) {
      console.log(`  📦 Dependencies added to ${depUpdate.buildFilePath}:`);
      for (const dep of depUpdate.addedDependencies) {
        console.log(`     + ${dep}`);
      }
    } else if (depUpdate.success && depUpdate.existingDependencies && depUpdate.existingDependencies.length > 0) {
      console.log(`  📦 Dependencies already present in ${depUpdate.buildFilePath}`);
    } else if (!depUpdate.success && depUpdate.error) {
      console.log(`  ⚠️  Could not update dependencies: ${depUpdate.error}`);
      if (depUpdate.warnings) {
        console.log('');
        console.log('  Please add manually:');
        for (const warning of depUpdate.warnings) {
          console.log(`     ${warning}`);
        }
      }
    }
  }

  console.log('');
  console.log('  Usage in your Java code:');
  console.log('');
  const examplePackage = basePackage ?? 'com.dinoconfig.sdk.generated';
  console.log(`    import ${examplePackage}.brandname.ConfigName;`);
  console.log('');
}

export async function runJavagen(args: string[]): Promise<void> {
  const options = parseArgs(args);

  if (options.help) {
    showUsage();
    process.exit(0);
  }

  if (options.version) {
    console.log(`DinoConfig Java Model Generator v${CLI_VERSION}`);
    process.exit(0);
  }

  if (!options.apiKey) {
    console.error('Error: --api-key is required\n');
    console.error('Run with --help for usage information');
    process.exit(1);
  }

  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const output = options.output ?? DEFAULT_JAVA_OUTPUT;

  logConfig(baseUrl, output, options.package);

  console.log('  → Initializing SDK...');
  console.log('  → Fetching configuration schemas...');

  const result = await generateJavaModels({
    apiKey: options.apiKey,
    baseUrl,
    output,
    package: options.package,
    skipDependencyUpdate: options.skipDeps,
  });

  if (!result.success) {
    console.error(`\n❌ Error: ${result.error}`);
    process.exit(1);
  }

  console.log(`  → Found ${result.stats?.brands} brand(s)`);
  console.log(`  → Found ${result.stats?.configs} config(s) with ${result.stats?.keys} key(s)`);
  console.log(`  → Using package: ${result.basePackage}`);
  console.log('  → Generating Java model classes...');
  console.log(`  → Writing to ${output}...`);

  if (!options.skipDeps) {
    if (result.dependencyUpdate?.success && result.dependencyUpdate.addedDependencies?.length) {
      console.log('  → Updating project dependencies...');
    } else if (result.dependencyUpdate?.success) {
      console.log('  → Dependencies already present');
    }
  }

  logSuccess(output, result.stats, result.dependencyUpdate, result.basePackage);
}

// Run directly if called as main script
if (process.argv[1]?.includes('javagen')) {
  runJavagen(process.argv.slice(2)).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n❌ Error:', message);
    process.exit(1);
  });
}
