/**
 * DinoConfig CLI
 *
 * Command-line tools for DinoConfig including type generation.
 *
 * @packageDocumentation
 * @module @dinoconfig/cli
 * @version 1.0.0
 * @license MIT
 *
 * @example Generate types
 * ```bash
 * npx @dinoconfig/cli codegen --api-key=dino_xxx --output=./src/types/dinoconfig.d.ts
 * ```
 *
 * @see {@link https://docs.dinoconfig.com | Documentation}
 */

// Codegen API
export { generateTypes, generateJavaModels } from './lib/codegen';
export type { 
  GenerateTypesOptions, 
  GenerateTypesResult, 
  GenerateTypesStats,
  GenerateJavaModelsOptions,
  GenerateJavaModelsResult,
} from './lib/codegen';

// Type generator classes
export { TypeGenerator } from './lib/type-generator';
export { JavaModelGenerator } from './lib/java-model-generator';

// Constants (for advanced usage)
export {
  CLI_NAME,
  CLI_VERSION,
  DEFAULT_OUTPUT,
  DEFAULT_BASE_URL,
  DEFAULT_NAMESPACE,
} from './lib/constants';
