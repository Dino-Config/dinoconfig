/**
 * @fileoverview Programmatic API for type generation.
 * @module @dinoconfig/cli/codegen
 */

import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';
import { TypeGenerator } from './type-generator';
import { JavaModelGenerator, derivePackageFromPath } from './java-model-generator';
import { updateProjectDependencies, type DependencyUpdateResult } from './dependency-updater';
import { DEFAULT_OUTPUT, DEFAULT_BASE_URL, DEFAULT_NAMESPACE } from './constants';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Options for generating TypeScript types.
 */
export interface GenerateTypesOptions {
  /** DinoConfig API key */
  apiKey: string;
  /** API base URL */
  baseUrl?: string;
  /** Output file path */
  output?: string;
  /** Root namespace name */
  namespace?: string;
}

/**
 * Statistics about generated types.
 */
export interface GenerateTypesStats {
  brands: number;
  configs: number;
  keys: number;
}

/**
 * Result of type generation.
 */
export interface GenerateTypesResult {
  /** Whether generation was successful */
  success: boolean;
  /** Output file path */
  outputPath?: string;
  /** Generated content */
  content?: string;
  /** Error message if failed */
  error?: string;
  /** Statistics about generated types */
  stats?: GenerateTypesStats;
}

/**
 * Ensures the output directory exists.
 */
function ensureDirectoryExists(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Counts total configs and keys from introspection data.
 */
function countStats(brands: readonly { configs: readonly { keys: readonly unknown[] }[] }[]): { configs: number; keys: number } {
  let configs = 0;
  let keys = 0;

  for (const brand of brands) {
    configs += brand.configs.length;
    for (const config of brand.configs) {
      keys += config.keys.length;
    }
  }

  return { configs, keys };
}

/**
 * Generates TypeScript types from DinoConfig schemas.
 *
 * @param options - Generation options
 * @returns Generation result
 *
 * @example
 * ```typescript
 * import { generateTypes } from '@dinoconfig/cli';
 *
 * const result = await generateTypes({
 *   apiKey: 'dino_xxx',
 *   output: './src/types/dinoconfig.d.ts',
 * });
 *
 * if (result.success) {
 *   console.log(`Generated ${result.stats?.configs} config types`);
 * }
 * ```
 */
export async function generateTypes(options: GenerateTypesOptions): Promise<GenerateTypesResult> {
  const {
    apiKey,
    baseUrl = DEFAULT_BASE_URL,
    output = DEFAULT_OUTPUT,
    namespace = DEFAULT_NAMESPACE,
  } = options;

  try {
    const dinoconfig = await dinoconfigApi({ apiKey, baseUrl });
    const response = await dinoconfig.discovery.introspect();

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.message || 'Failed to fetch introspection data',
      };
    }

    const { brands } = response.data;
    const { configs: totalConfigs, keys: totalKeys } = countStats(brands);

    const generator = new TypeGenerator(namespace);
    const content = generator.generate(response.data);

    const absolutePath = path.resolve(process.cwd(), output);
    ensureDirectoryExists(absolutePath);
    fs.writeFileSync(absolutePath, content, 'utf-8');

    return {
      success: true,
      outputPath: absolutePath,
      content,
      stats: {
        brands: brands.length,
        configs: totalConfigs,
        keys: totalKeys,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Options for generating Java models.
 */
export interface GenerateJavaModelsOptions {
  /** DinoConfig API key */
  apiKey: string;
  /** API base URL */
  baseUrl?: string;
  /** Output directory path (where the generated folder will be created) */
  output?: string;
  /** 
   * Base package for generated classes (e.g., 'org.example.models').
   * If not specified, automatically derived from output path.
   */
  package?: string;
  /** Skip updating the project's build file with required dependencies */
  skipDependencyUpdate?: boolean;
}

/**
 * Result of Java model generation.
 */
export interface GenerateJavaModelsResult {
  /** Whether generation was successful */
  success: boolean;
  /** Output directory path */
  outputDir?: string;
  /** Generated file paths */
  generatedFiles?: string[];
  /** Error message if failed */
  error?: string;
  /** Statistics about generated models */
  stats?: GenerateTypesStats;
  /** Result of dependency update operation */
  dependencyUpdate?: DependencyUpdateResult;
  /** The base package used for generated classes */
  basePackage?: string;
}

/**
 * Generates Java model classes from DinoConfig schemas.
 *
 * @param options - Generation options
 * @returns Generation result
 *
 * @example
 * ```typescript
 * import { generateJavaModels } from '@dinoconfig/cli';
 *
 * const result = await generateJavaModels({
 *   apiKey: 'dino_xxx',
 *   output: './libs/dinoconfig-java-sdk/lib/src/main/java',
 * });
 *
 * if (result.success) {
 *   console.log(`Generated ${result.stats?.configs} config models`);
 * }
 * ```
 */
export async function generateJavaModels(
  options: GenerateJavaModelsOptions
): Promise<GenerateJavaModelsResult> {
  const {
    apiKey,
    baseUrl = DEFAULT_BASE_URL,
    output = './libs/dinoconfig-java-sdk/lib/src/main/java/com/dinoconfig/sdk/generated',
    skipDependencyUpdate = false,
  } = options;

  try {
    const dinoconfig = await dinoconfigApi({ apiKey, baseUrl });
    const response = await dinoconfig.discovery.introspect();

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.message || 'Failed to fetch introspection data',
      };
    }

    const { brands } = response.data;
    const { configs: totalConfigs, keys: totalKeys } = countStats(brands);

    // Determine the base package: explicit option > derived from path > default
    const absoluteOutputDir = path.resolve(process.cwd(), output);
    const basePackage = options.package ?? derivePackageFromPath(absoluteOutputDir);

    const generator = new JavaModelGenerator({ basePackage });
    const files = generator.generate(response.data);

    const generatedFiles: string[] = [];

    // Write all generated files - files are now written relative to output dir
    // The generator returns paths like "brandname/ConfigName.java" (without base package path)
    for (const [filePath, content] of files.entries()) {
      const fullPath = path.join(absoluteOutputDir, filePath);
      ensureDirectoryExists(fullPath);
      fs.writeFileSync(fullPath, content, 'utf-8');
      generatedFiles.push(fullPath);
    }

    // Update project dependencies if not skipped
    let dependencyUpdate: DependencyUpdateResult | undefined;
    if (!skipDependencyUpdate) {
      dependencyUpdate = updateProjectDependencies(absoluteOutputDir);
    }

    return {
      success: true,
      outputDir: absoluteOutputDir,
      generatedFiles,
      stats: {
        brands: brands.length,
        configs: totalConfigs,
        keys: totalKeys,
      },
      dependencyUpdate,
      basePackage: generator.getBasePackage(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
