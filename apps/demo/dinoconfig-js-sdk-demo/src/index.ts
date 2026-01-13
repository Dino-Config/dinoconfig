import { dinoconfigApi, DinoConfigInstance } from '@dinoconfig/dinoconfig-js-sdk';
import type {
  BrandInfo,
  ConfigInfo,
  FieldSchema,
  KeyInfo,
  ConfigInfoDetail,
  BrandInfoDetail,
  ConfigData,
} from '@dinoconfig/dinoconfig-js-sdk';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SDK_NAME = 'DinoConfig JavaScript SDK';
const SDK_VERSION = '1.0.0';
const DEFAULT_BASE_URL = 'http://localhost:3000';
const DEFAULT_TIMEOUT = 10000;

/** Demo configuration - change these to match your setup */
const DEMO_BRAND = 'Demo';
const DEMO_CONFIG = 'MyConfig';
const DEMO_KEY = 'test';

// ─────────────────────────────────────────────────────────────────────────────
// Logging Helpers
// ─────────────────────────────────────────────────────────────────────────────

const log = {
  header: (title: string): void => {
    console.log('=========================================');
    console.log(title);
    console.log('=========================================');
  },

  success: (message: string): void => {
    console.log(`✓ ${message}`);
  },

  error: (message: string): void => {
    console.log(`✗ ${message}`);
  },

  info: (message: string): void => {
    console.log(message);
  },

  json: (data: unknown, indent = 2): void => {
    console.log(JSON.stringify(data, null, indent));
  },
};

/**
 * Handles API call errors with consistent formatting.
 */
function handleError(error: unknown, context: string): void {
  const message = error instanceof Error ? error.message : 'Unknown error';
  log.error(`Error ${context}:`);
  console.log(`  Message: ${message}`);
  console.log("  This is expected if you don't have valid credentials or the resource doesn't exist.");
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo Sections
// ─────────────────────────────────────────────────────────────────────────────

async function demoListBrands(sdk: DinoConfigInstance): Promise<void> {
  log.header('Discovery API: List Brands');
  console.log('Calling: dinoconfig.discovery.listBrands()\n');

  try {
    const response = await sdk.discovery.listBrands();

    if (response.success) {
      log.success('Request successful!');
      console.log(`Found ${response.data.length} brand(s):\n`);

      response.data.forEach((brand: BrandInfo, index: number) => {
        console.log(`  ${index + 1}. ${brand.name}`);
        if (brand.description) console.log(`     Description: ${brand.description}`);
        console.log(`     Configs: ${brand.configCount}`);
        console.log(`     Created: ${brand.createdAt}\n`);
      });
    } else {
      log.error(`Request failed: ${response.message || 'Unknown error'}`);
    }
  } catch (error) {
    handleError(error, 'listing brands');
  }
}

async function demoListConfigs(sdk: DinoConfigInstance): Promise<void> {
  log.header('Discovery API: List Configs');
  console.log(`Calling: dinoconfig.discovery.listConfigs("${DEMO_BRAND}")\n`);

  try {
    const response = await sdk.discovery.listConfigs(DEMO_BRAND);

    if (response.success) {
      log.success('Request successful!');
      console.log(`Found ${response.data.length} config(s):\n`);

      response.data.forEach((config: ConfigInfo, index: number) => {
        console.log(`  ${index + 1}. ${config.name} (v${config.version})`);
        if (config.description) console.log(`     Description: ${config.description}`);
        const keyPreview = config.keys.slice(0, 3).join(', ');
        const hasMore = config.keys.length > 3 ? '...' : '';
        console.log(`     Keys: ${config.keys.length} [${keyPreview}${hasMore}]`);
        console.log(`     Created: ${config.createdAt}\n`);
      });
    } else {
      log.error(`Request failed: ${response.message || 'Unknown error'}`);
    }
  } catch (error) {
    handleError(error, 'listing configs');
  }
}

async function demoGetSchema(sdk: DinoConfigInstance): Promise<void> {
  log.header('Discovery API: Get Config Schema');
  console.log(`Calling: dinoconfig.discovery.getSchema("${DEMO_BRAND}", "${DEMO_CONFIG}")\n`);

  try {
    const response = await sdk.discovery.getSchema(DEMO_BRAND, DEMO_CONFIG);

    if (response.success) {
      log.success('Request successful!');
      console.log(`Config: ${response.data.configName} (v${response.data.version})`);
      console.log(`Fields: ${Object.keys(response.data.fields).length}\n`);

      Object.entries(response.data.fields).forEach(([name, field]: [string, FieldSchema]) => {
        console.log(`  • ${name}: ${field.type}`);
        if (field.description) console.log(`    Description: ${field.description}`);
        if (field.required) console.log(`    Required: ${field.required}`);
      });
    } else {
      log.error(`Request failed: ${response.message || 'Unknown error'}`);
    }
  } catch (error) {
    handleError(error, 'getting schema');
  }
}

async function demoIntrospect(sdk: DinoConfigInstance): Promise<void> {
  log.header('Discovery API: Full Introspection');
  console.log('Calling: dinoconfig.discovery.introspect()\n');

  try {
    const response = await sdk.discovery.introspect();

    if (response.success) {
      log.success('Request successful!');
      console.log(`Company: ${response.data.company}`);
      console.log(`Brands: ${response.data.brands.length}`);
      console.log(`Generated at: ${response.data.generatedAt}\n`);

      response.data.brands.forEach((brand: BrandInfoDetail, brandIndex: number) => {
        console.log(`Brand ${brandIndex + 1}: ${brand.name}`);
        if (brand.description) console.log(`  Description: ${brand.description}`);
        console.log(`  Configs: ${brand.configs.length}\n`);

        brand.configs.forEach((config: ConfigInfoDetail, configIndex: number) => {
          console.log(`    Config ${configIndex + 1}: ${config.name} (v${config.version})`);
          if (config.description) console.log(`      Description: ${config.description}`);
          console.log(`      Keys: ${config.keys.length}`);

          if (config.keys.length > 0) {
            console.log('      Sample keys:');
            config.keys.slice(0, 3).forEach((key: KeyInfo) => {
              console.log(`        - ${key.name} (${key.type}): ${JSON.stringify(key.value)}`);
            });
            if (config.keys.length > 3) {
              console.log(`        ... and ${config.keys.length - 3} more`);
            }
          }
          console.log();
        });
      });
    } else {
      log.error(`Request failed: ${response.message || 'Unknown error'}`);
    }
  } catch (error) {
    handleError(error, 'during introspection');
  }
}

async function demoGetConfig(sdk: DinoConfigInstance): Promise<void> {
  // Full parameters
  log.header('Configs API: get (Full Parameters)');
  console.log(`Calling: dinoconfig.configs.get("${DEMO_BRAND}", "${DEMO_CONFIG}")\n`);

  try {
    const response = await sdk.configs.get(DEMO_BRAND, DEMO_CONFIG);

    if (response.success) {
      log.success('Request successful!');
      console.log(`Config name: ${response.data.name}`);
      console.log(`Version: ${response.data.version}`);
      console.log(`Keys: ${response.data.keys.join(', ') || '(none)'}`);
      console.log('Values:');
      log.json(response.data.values);
    } else {
      log.error(`Request failed: ${response.message || 'Unknown error'}`);
    }
  } catch (error) {
    handleError(error, 'retrieving config');
  }

  console.log();

  // Shorthand
  log.header('Configs API: get (Shorthand Path)');
  const shorthandPath = `${DEMO_BRAND}.${DEMO_CONFIG}`;
  console.log(`Calling: dinoconfig.configs.get("${shorthandPath}")\n`);

  try {
    const response = await sdk.configs.get(shorthandPath);

    if (response.success) {
      log.success('Request successful!');
      console.log(`Config: ${response.data.name} (v${response.data.version})`);
      console.log('All values:');
      log.json(response.data.values);
    } else {
      log.error(`Request failed: ${response.message || 'Unknown error'}`);
    }
  } catch (error) {
    handleError(error, 'retrieving config');
  }
}

async function demoGetValue(sdk: DinoConfigInstance): Promise<void> {
  // Shorthand
  log.header('Configs API: getValue (Shorthand Path)');
  const shorthandPath = `${DEMO_BRAND}.${DEMO_CONFIG}.${DEMO_KEY}`;
  console.log(`Calling: dinoconfig.configs.getValue("${shorthandPath}")\n`);

  try {
    const response = await sdk.configs.getValue(shorthandPath);

    if (response.success) {
      log.success('Request successful!');
      console.log('Config value:');
      log.json(response.data);
    } else {
      log.error(`Request failed: ${response.message || 'Unknown error'}`);
    }
  } catch (error) {
    handleError(error, 'retrieving config value');
  }

  console.log();

  // Full parameters
  log.header('Configs API: getValue (Full Parameters)');
  console.log(`Calling: dinoconfig.configs.getValue("${DEMO_BRAND}", "${DEMO_CONFIG}", "${DEMO_KEY}")\n`);

  try {
    const response = await sdk.configs.getValue(DEMO_BRAND, DEMO_CONFIG, DEMO_KEY);

    if (response.success) {
      log.success('Request successful!');
      console.log('Config value:');
      log.json(response.data);
    } else {
      log.error(`Request failed: ${response.message || 'Unknown error'}`);
    }
  } catch (error) {
    handleError(error, 'retrieving config value');
  }
}

async function demoCache(sdk: DinoConfigInstance): Promise<void> {
  log.header('Cache Layer Demonstration');
  console.log('Testing cache with both get() and getValue() methods...\n');

  // Clear cache before starting tests to ensure clean state
  console.log('🧹 Clearing cache before starting cache tests...');
  await sdk.cache.clear();
  console.log('✓ Cache cleared\n');

  const brandName = DEMO_BRAND;
  const configName = DEMO_CONFIG;
  const configKey = DEMO_KEY;

  // ─────────────────────────────────────────────────────────────────────────────
  // Test 1: getValue() - First request (cache miss)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('1️⃣ Testing getValue() - First Request (Cache Miss Expected):');
  console.log(`   Calling: getValue("${brandName}", "${configName}", "${configKey}")`);
  const start1 = performance.now();
  let duration1 = 0;
  
  try {
    const response1 = await sdk.configs.getValue(
      brandName,
      configName,
      configKey
    );
    duration1 = performance.now() - start1;

    if (response1.success) {
      console.log(`   ✓ Request successful in ${duration1.toFixed(2)}ms`);
      console.log(`   Config value: ${JSON.stringify(response1.data, null, 2)}`);
    } else {
      console.log('   ✗ Request failed');
      console.log(`   Message: ${response1.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    duration1 = performance.now() - start1;
    console.log(`   ✗ Error after ${duration1.toFixed(2)}ms:`);
    console.log(`     Message: ${error.message || 'Unknown error'}`);
    console.log('     This is expected if you don\'t have valid credentials or the config doesn\'t exist.');
  }

  const stats1 = sdk.cache.getStats();
  console.log(`   📊 Cache Stats: ${stats1.hits} hits, ${stats1.misses} misses, ${(stats1.hitRate * 100).toFixed(1)}% hit rate`);
  console.log();

  // ─────────────────────────────────────────────────────────────────────────────
  // Test 2: getValue() - Second request (cache hit)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('2️⃣ Testing getValue() - Second Request (Cache Hit Expected):');
  console.log(`   Calling: getValue("${brandName}", "${configName}", "${configKey}")`);
  const start2 = performance.now();
  
  try {
    const response2 = await sdk.configs.getValue(
      brandName,
      configName,
      configKey
    );
    const duration2 = performance.now() - start2;

    if (response2.success) {
      console.log(`   ✓ Request successful in ${duration2.toFixed(2)}ms (from cache!)`);
      console.log(`   Config value: ${JSON.stringify(response2.data, null, 2)}`);
      if (duration1 > 0) {
        console.log(`   ⚡ Speed improvement: ${((duration1 - duration2) / duration1 * 100).toFixed(1)}% faster`);
      }
    } else {
      console.log('   ✗ Request failed');
      console.log(`   Message: ${response2.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    const duration2 = performance.now() - start2;
    console.log(`   ✗ Error after ${duration2.toFixed(2)}ms:`);
    console.log(`     Message: ${error.message || 'Unknown error'}`);
  }

  const stats2 = sdk.cache.getStats();
  console.log(`   📊 Cache Stats: ${stats2.hits} hits, ${stats2.misses} misses, ${(stats2.hitRate * 100).toFixed(1)}% hit rate`);
  console.log();

  // ─────────────────────────────────────────────────────────────────────────────
  // Test 3: get() - First request (cache miss)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('3️⃣ Testing get() - First Request (Cache Miss Expected):');
  console.log(`   Calling: get("${brandName}", "${configName}")`);
  const start3 = performance.now();
  let duration3 = 0;
  
  try {
    const response3 = await sdk.configs.get(brandName, configName);
    duration3 = performance.now() - start3;

    if (response3.success) {
      console.log(`   ✓ Request successful in ${duration3.toFixed(2)}ms`);
      console.log(`   Config: ${response3.data.name} (v${response3.data.version})`);
      console.log(`   Keys: ${response3.data.keys.length}`);
    } else {
      console.log('   ✗ Request failed');
      console.log(`   Message: ${response3.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    duration3 = performance.now() - start3;
    console.log(`   ✗ Error after ${duration3.toFixed(2)}ms:`);
    console.log(`     Message: ${error.message || 'Unknown error'}`);
  }

  const stats3 = sdk.cache.getStats();
  console.log(`   📊 Cache Stats: ${stats3.hits} hits, ${stats3.misses} misses, ${(stats3.hitRate * 100).toFixed(1)}% hit rate`);
  console.log();

  // ─────────────────────────────────────────────────────────────────────────────
  // Test 4: get() - Second request (cache hit)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('4️⃣ Testing get() - Second Request (Cache Hit Expected):');
  console.log(`   Calling: get("${brandName}", "${configName}")`);
  const start4 = performance.now();
  
  try {
    const response4 = await sdk.configs.get(brandName, configName);
    const duration4 = performance.now() - start4;

    if (response4.success) {
      console.log(`   ✓ Request successful in ${duration4.toFixed(2)}ms (from cache!)`);
      console.log(`   Config: ${response4.data.name} (v${response4.data.version})`);
      if (duration3 > 0) {
        console.log(`   ⚡ Speed improvement: ${((duration3 - duration4) / duration3 * 100).toFixed(1)}% faster`);
      }
    } else {
      console.log('   ✗ Request failed');
      console.log(`   Message: ${response4.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    const duration4 = performance.now() - start4;
    console.log(`   ✗ Error after ${duration4.toFixed(2)}ms:`);
    console.log(`     Message: ${error.message || 'Unknown error'}`);
  }

  const stats4 = sdk.cache.getStats();
  console.log(`   📊 Cache Stats: ${stats4.hits} hits, ${stats4.misses} misses, ${(stats4.hitRate * 100).toFixed(1)}% hit rate`);
  console.log();

  // ─────────────────────────────────────────────────────────────────────────────
  // Test 5: Force refresh (bypass cache)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('5️⃣ Testing Force Refresh (Bypass Cache):');
  console.log(`   Calling: getValue("${brandName}", "${configName}", "${configKey}", { forceRefresh: true })`);
  const start5 = performance.now();
  
  try {
    const response5 = await sdk.configs.getValue(
      brandName,
      configName,
      configKey,
      { forceRefresh: true }
    );
    const duration5 = performance.now() - start5;

    if (response5.success) {
      console.log(`   ✓ Request successful in ${duration5.toFixed(2)}ms (from network)`);
      console.log(`   Config value: ${JSON.stringify(response5.data, null, 2)}`);
    } else {
      console.log('   ✗ Request failed');
      console.log(`   Message: ${response5.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    const duration5 = performance.now() - start5;
    console.log(`   ✗ Error after ${duration5.toFixed(2)}ms:`);
    console.log(`     Message: ${error.message || 'Unknown error'}`);
  }

  const stats5 = sdk.cache.getStats();
  console.log(`   📊 Cache Stats: ${stats5.hits} hits, ${stats5.misses} misses, ${(stats5.hitRate * 100).toFixed(1)}% hit rate`);
  console.log();

  // ─────────────────────────────────────────────────────────────────────────────
  // Test 6: Cache invalidation
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('6️⃣ Testing Cache Invalidation:');
  console.log('   Invalidating cache for pattern: "config:*"');
  await sdk.cache.invalidate('config:*');
  console.log('   ✓ Cache invalidated');

  // Request after invalidation - should hit network again
  console.log(`\n   Calling: getValue("${brandName}", "${configName}", "${configKey}")`);
  const start6 = performance.now();
  
  try {
    const response6 = await sdk.configs.getValue(
      brandName,
      configName,
      configKey
    );
    const duration6 = performance.now() - start6;

    if (response6.success) {
      console.log(`   ✓ Request successful in ${duration6.toFixed(2)}ms (from network after invalidation)`);
    } else {
      console.log('   ✗ Request failed');
      console.log(`   Message: ${response6.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    const duration6 = performance.now() - start6;
    console.log(`   ✗ Error after ${duration6.toFixed(2)}ms:`);
    console.log(`     Message: ${error.message || 'Unknown error'}`);
  }

  // Show final cache stats
  const stats6 = sdk.cache.getStats();
  console.log(`\n   📊 Final Cache Stats: ${stats6.hits} hits, ${stats6.misses} misses, ${(stats6.hitRate * 100).toFixed(1)}% hit rate`);
  console.log();
}

function showAvailableMethods(): void {
  log.header('Available API Methods');

  console.log('Configs API:');
  console.log('  • configs.get(path)                           - get entire config (shorthand)');
  console.log('  • configs.get(brand, config)                  - get entire config');
  console.log('  • configs.getValue(path)                      - get single value (shorthand)');
  console.log('  • configs.getValue(brand, config, key)        - get single value');
  console.log();

  console.log('Discovery API:');
  console.log('  • discovery.listBrands()                      - list all brands');
  console.log('  • discovery.listConfigs(brand)                - list configs for brand');
  console.log('  • discovery.getSchema(brand, config)          - get config schema');
  console.log('  • discovery.introspect()                      - full introspection');
  console.log();

  console.log('Cache API:');
  console.log('  • cache.getStats()                            - get cache statistics');
  console.log('  • cache.clear()                               - clear all cache');
  console.log('  • cache.invalidate(pattern)                   - invalidate by pattern');
  console.log('  • cache.prefetch(key, fetcher)                 - prefetch into cache');
  console.log();
}

function showExamplePatterns(): void {
  log.header('Example: SDK Usage Patterns');

  const examples = `
// Initialize SDK
const dinoconfig = await dinoconfigApi({
  apiKey: "your-api-key",
  baseUrl: "https://api.dinoconfig.com",
  cache: {
    enabled: true,
    ttl: 60000,
    storage: "localStorage",
  },
});

// Get entire config
const config = await dinoconfig.configs.get("Brand.Config");
console.log(config.data.values);

// Get single value
const value = await dinoconfig.configs.getValue("Brand.Config.Key");
console.log(value.data);

// Discovery
const brands = await dinoconfig.discovery.listBrands();
const configs = await dinoconfig.discovery.listConfigs("Brand");
const schema = await dinoconfig.discovery.getSchema("Brand", "Config");
const all = await dinoconfig.discovery.introspect();

// Cache management
const stats = dinoconfig.cache.getStats();
await dinoconfig.cache.invalidate("brand:.*");
`;

  console.log(examples);
}

function showCompletionInstructions(): void {
  log.header('Demo Complete!');

  console.log('\nTo use the SDK in your application:');
  console.log('1. Install: npm install @dinoconfig/dinoconfig-js-sdk');
  console.log('2. Import: import { dinoconfigApi } from "@dinoconfig/dinoconfig-js-sdk";');
  console.log('3. Initialize: const dinoconfig = await dinoconfigApi({ apiKey: "..." });');
  console.log('4. Use: const value = await dinoconfig.configs.getValue("Brand.Config.Key");');
  console.log('\nSee README.md for complete documentation.');
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Demo Runner
// ─────────────────────────────────────────────────────────────────────────────

async function runDemo(apiKey: string, baseUrl?: string): Promise<void> {
  log.header(`${SDK_NAME} Demo`);
  console.log();

  // Initialize SDK with cache enabled
  console.log('Initializing SDK with cache enabled...');
  const sdk = await dinoconfigApi({
    apiKey,
    baseUrl: baseUrl || DEFAULT_BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    cache: {
      enabled: true,
      ttl: 60000, // 1 minute
      maxSize: 1000,
      storage: 'localStorage',
      staleWhileRevalidate: false,
    },
  });
  log.success('SDK initialized successfully\n');

  // Show SDK info
  log.header('SDK Configuration Info');
  console.log(`SDK Name: ${SDK_NAME}`);
  console.log(`SDK Version: ${SDK_VERSION}`);
  console.log();

  // Show available methods
  showAvailableMethods();

  // Run demos
  await demoListBrands(sdk);
  console.log();

  await demoListConfigs(sdk);
  console.log();

  await demoGetSchema(sdk);
  console.log();

  await demoIntrospect(sdk);
  console.log();

  await demoGetConfig(sdk);
  console.log();

  await demoGetValue(sdk);
  console.log();

  await demoCache(sdk);
  console.log();

  // Show examples and completion
  showExamplePatterns();
  showCompletionInstructions();
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────

interface ParsedArgs {
  apiKey?: string;
  baseUrl?: string;
}

function parseArgs(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = {};

  for (const arg of args) {
    if (arg.startsWith('--api-key=')) {
      parsed.apiKey = arg.slice('--api-key='.length);
    } else if (arg.startsWith('--baseUrl=') || arg.startsWith('--base-url=')) {
      const prefix = arg.startsWith('--baseUrl=') ? '--baseUrl=' : '--base-url=';
      parsed.baseUrl = arg.slice(prefix.length);
    }
  }

  return parsed;
}

function showUsage(): void {
  console.log('Usage: npm start -- --api-key=YOUR_API_KEY [--baseUrl=YOUR_BASE_URL]');
  console.log('\nExample:');
  console.log('  npm start -- --api-key=dino_your-api-key-here');
  console.log('  npm start -- --api-key=dino_your-api-key-here --baseUrl=https://api.dinoconfig.com');
  console.log('\nOr with tsx:');
  console.log('  npm run dev -- --api-key=dino_your-api-key-here');
  console.log('  npm run dev -- --api-key=dino_your-api-key-here --baseUrl=http://localhost:3000');
}

async function main(): Promise<void> {
  const { apiKey, baseUrl } = parseArgs(process.argv.slice(2));

  if (!apiKey) {
    showUsage();
    process.exit(1);
  }

  try {
    await runDemo(apiKey, baseUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error running demo:', message);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the demo
main();
