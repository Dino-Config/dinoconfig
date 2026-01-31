/**
 * DinoConfig CLI - Main entry point
 *
 * @example
 * ```bash
 * npx @dinoconfig/cli codegen --api-key=dino_xxx
 * npx @dinoconfig/cli --help
 * ```
 */

import { CLI_NAME, CLI_VERSION } from '../lib/constants';

function showHelp(): void {
  console.log(`
${CLI_NAME} v${CLI_VERSION}

DinoConfig Command Line Interface

USAGE:
  npx ${CLI_NAME} <command> [options]

COMMANDS:
  codegen     Generate TypeScript types from DinoConfig schemas
  javagen     Generate Java model classes from DinoConfig schemas

OPTIONS:
  -h, --help      Show this help message
  -v, --version   Show version number

EXAMPLES:
  # Generate TypeScript types
  npx ${CLI_NAME} codegen --api-key=dino_abc123

  # Generate Java models
  npx ${CLI_NAME} javagen --api-key=dino_abc123

  # Show command help
  npx ${CLI_NAME} codegen --help
  npx ${CLI_NAME} javagen --help

For more information, visit: https://docs.dinoconfig.com
`);
}

function handleError(error: unknown): never {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('Error:', message);
  process.exit(1);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }

  if (command === '--version' || command === '-v') {
    console.log(`${CLI_NAME} v${CLI_VERSION}`);
    process.exit(0);
  }

  switch (command) {
    case 'codegen': {
      const { runCodegen } = await import('./codegen.js');
      await runCodegen(args.slice(1));
      break;
    }
    case 'javagen': {
      const { runJavagen } = await import('./javagen.js');
      await runJavagen(args.slice(1));
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      console.error(`Run '${CLI_NAME} --help' for usage information`);
      process.exit(1);
  }
}

main().catch(handleError);
