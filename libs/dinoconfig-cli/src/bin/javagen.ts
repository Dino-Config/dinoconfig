#!/usr/bin/env node
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
  help?: boolean;
  version?: boolean;
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
  -h, --help            Show this help message
  -v, --version         Show version number

EXAMPLES:
  # Generate Java models with default settings
  npx ${CLI_NAME} javagen --api-key=dino_abc123

  # Generate Java models to custom path
  npx ${CLI_NAME} javagen --api-key=dino_abc123 --output=./src/main/java/com/example/generated

  # Use production API
  npx ${CLI_NAME} javagen --api-key=dino_abc123 --baseUrl=https://api.dinoconfig.com

GENERATED OUTPUT:
  The tool generates Java POJO classes in a generated folder:
  - Each brand gets its own package
  - Each config gets its own class with typed fields
  - Classes follow Java best practices (immutable, Jackson annotations, etc.)

  Example generated structure:
    com/dinoconfig/sdk/generated/
      mybrand/
        FeatureFlags.java
        AppSettings.java

  Usage with the SDK:
    import com.dinoconfig.sdk.generated.mybrand.FeatureFlags;
    
    ApiResponse<ConfigData> response = configAPI.get("MyBrand", "FeatureFlags");
    ConfigData config = response.getData();
    // Use generated models for type safety
`);
}

function logConfig(baseUrl: string, output: string): void {
  console.log(`\n🦖 DinoConfig Java Model Generator v${CLI_VERSION}\n`);
  console.log(`  Base URL:  ${baseUrl}`);
  console.log(`  Output:    ${output}`);
  console.log('');
}

function logSuccess(output: string, stats?: { brands: number; configs: number; keys: number }): void {
  console.log('\n✅ Java models generated successfully!\n');
  if (stats) {
    console.log(`  Generated ${stats.brands} brand(s)`);
    console.log(`  Generated ${stats.configs} config class(es) with ${stats.keys} field(s)`);
  }
  console.log(`  Output directory: ${output}`);
  console.log('');
  console.log('  Usage in your Java code:');
  console.log('');
  console.log('    import com.dinoconfig.sdk.generated.brandname.ConfigName;');
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

  logConfig(baseUrl, output);

  console.log('  → Initializing SDK...');
  console.log('  → Fetching configuration schemas...');

  const result = await generateJavaModels({
    apiKey: options.apiKey,
    baseUrl,
    output,
  });

  if (!result.success) {
    console.error(`\n❌ Error: ${result.error}`);
    process.exit(1);
  }

  console.log(`  → Found ${result.stats?.brands} brand(s)`);
  console.log(`  → Found ${result.stats?.configs} config(s) with ${result.stats?.keys} key(s)`);
  console.log('  → Generating Java model classes...');
  console.log(`  → Writing to ${output}...`);

  logSuccess(output, result.stats);
}

// Run directly if called as main script
if (process.argv[1]?.includes('javagen')) {
  runJavagen(process.argv.slice(2)).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n❌ Error:', message);
    process.exit(1);
  });
}
