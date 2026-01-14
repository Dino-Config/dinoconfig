#!/usr/bin/env node
/**
 * DinoConfig Type Generator CLI
 *
 * Generates TypeScript type definitions from DinoConfig schemas.
 *
 * @example
 * ```bash
 * npx @dinoconfig/cli codegen --api-key=dino_xxx --output=./src/types/dinoconfig.d.ts
 * npx dinoconfig-codegen --api-key=dino_xxx
 * ```
 */

import { generateTypes } from '../lib/codegen';
import {
  CODEGEN_COMMAND,
  CLI_VERSION,
  DEFAULT_OUTPUT,
  DEFAULT_BASE_URL,
  DEFAULT_NAMESPACE,
} from '../lib/constants';

interface CliOptions {
  apiKey?: string;
  baseUrl?: string;
  output?: string;
  namespace?: string;
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
    } else if (arg.startsWith('--namespace=')) {
      options.namespace = arg.slice('--namespace='.length);
    }
  }

  return options;
}

function showUsage(): void {
  console.log(`
${CODEGEN_COMMAND} v${CLI_VERSION}

Generate TypeScript types from DinoConfig schemas.

USAGE:
  npx ${CODEGEN_COMMAND} --api-key=<key> [options]
  npx @dinoconfig/cli codegen --api-key=<key> [options]

OPTIONS:
  --api-key=<key>       Required. Your DinoConfig API key
  --baseUrl=<url>       API base URL (default: ${DEFAULT_BASE_URL})
  --output=<path>       Output file path (default: ${DEFAULT_OUTPUT})
  --namespace=<name>    Root namespace name (default: ${DEFAULT_NAMESPACE})
  -h, --help            Show this help message
  -v, --version         Show version number

EXAMPLES:
  # Generate types with default settings
  npx ${CODEGEN_COMMAND} --api-key=dino_abc123

  # Generate types to custom path
  npx ${CODEGEN_COMMAND} --api-key=dino_abc123 --output=./types/config.d.ts

  # Use production API
  npx ${CODEGEN_COMMAND} --api-key=dino_abc123 --baseUrl=https://api.dinoconfig.com

GENERATED OUTPUT:
  The tool generates a TypeScript declaration file with:
  - A namespace for each brand
  - An interface for each config
  - Typed properties for each config key

  Example generated code:
    export namespace DinoConfig {
      export namespace MyBrand {
        export interface FeatureFlags {
          enableDarkMode: boolean;
          maxUsers: number;
        }
      }
    }

  Usage with the SDK:
    import { DinoConfig } from './types/dinoconfig';
    
    const flags = await dinoconfig.configs.get<DinoConfig.MyBrand.FeatureFlags>(
      'MyBrand', 'FeatureFlags'
    );
    flags.data.values.enableDarkMode; // boolean ✓
`);
}

function logConfig(baseUrl: string, output: string, namespace: string): void {
  console.log(`\n🦖 ${CODEGEN_COMMAND} v${CLI_VERSION}\n`);
  console.log(`  Base URL:  ${baseUrl}`);
  console.log(`  Output:    ${output}`);
  console.log(`  Namespace: ${namespace}`);
  console.log('');
}

function logSuccess(output: string, namespace: string): void {
  console.log('\n✅ Types generated successfully!\n');
  console.log('  Usage in your code:');
  console.log('');
  console.log(`    import { ${namespace} } from '${output.replace(/\.d\.ts$/, '')}';`);
  console.log('');
  console.log(`    const config = await dinoconfig.configs.get<${namespace}.BrandName.ConfigName>(`);
  console.log("      'BrandName', 'ConfigName'");
  console.log('    );');
  console.log('');
}

export async function runCodegen(args: string[]): Promise<void> {
  const options = parseArgs(args);

  if (options.help) {
    showUsage();
    process.exit(0);
  }

  if (options.version) {
    console.log(`${CODEGEN_COMMAND} v${CLI_VERSION}`);
    process.exit(0);
  }

  if (!options.apiKey) {
    console.error('Error: --api-key is required\n');
    console.error('Run with --help for usage information');
    process.exit(1);
  }

  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const output = options.output ?? DEFAULT_OUTPUT;
  const namespace = options.namespace ?? DEFAULT_NAMESPACE;

  logConfig(baseUrl, output, namespace);

  console.log('  → Initializing SDK...');
  console.log('  → Fetching configuration schemas...');

  const result = await generateTypes({
    apiKey: options.apiKey,
    baseUrl,
    output,
    namespace,
  });

  if (!result.success) {
    console.error(`\n❌ Error: ${result.error}`);
    process.exit(1);
  }

  console.log(`  → Found ${result.stats?.brands} brand(s)`);
  console.log(`  → Found ${result.stats?.configs} config(s) with ${result.stats?.keys} key(s)`);
  console.log('  → Generating TypeScript types...');
  console.log(`  → Writing to ${output}...`);

  logSuccess(output, namespace);
}

// Run directly if called as main script
if (process.argv[1]?.includes('codegen')) {
  runCodegen(process.argv.slice(2)).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n❌ Error:', message);
    process.exit(1);
  });
}
