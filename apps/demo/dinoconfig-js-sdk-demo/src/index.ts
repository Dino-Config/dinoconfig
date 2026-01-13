import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';

/**
 * Demo application showcasing the DinoConfig JavaScript SDK.
 * This demonstrates how to use the SDK to retrieve configuration values.
 */
class DinoConfigJSDemo {
  /**
   * Run the SDK demo
   */
  async runDemo(apiKey: string, baseUrl?: string): Promise<void> {
    console.log('=========================================');
    console.log('DinoConfig JavaScript SDK Demo');
    console.log('=========================================\n');

    try {
      // Initialize SDK with cache enabled
      console.log('Initializing SDK with cache enabled...');
      const dinoconfig = await dinoconfigApi({
        apiKey,
        baseUrl: baseUrl || 'http://localhost:3000',
        timeout: 10000,
        cache: {
          enabled: true,
          ttl: 60000, // 1 minute
          maxSize: 1000,
          storage: 'localStorage', // Use localStorage for persistence
          staleWhileRevalidate: false,
        },
      });
      console.log('✓ SDK initialized successfully with cache\n');

      // Show SDK information
      console.log('=========================================');
      console.log('SDK Configuration Info');
      console.log('=========================================');
      console.log('SDK Name: DinoConfig JavaScript SDK');
      console.log('SDK Version: 1.0.0');
      console.log();

      // Show available API methods
      console.log('=========================================');
      console.log('Available API Methods');
      console.log('=========================================');
      console.log('✓ dinoconfig.configs.getConfigValue(brandName, configName, configValueKey)');
      console.log();

      // Demonstrate cache functionality
      console.log('=========================================');
      console.log('Cache Layer Demonstration');
      console.log('=========================================');
      console.log('Testing cache with configuration value retrieval...\n');

      const brandName = 'Paysafe';
      const configName = 'MyConfig';
      const configKey = 'test';

      // First request - should hit the network (cache miss)
      console.log('1️⃣ First Request (Cache Miss Expected):');
      console.log(`   Calling: getConfigValue("${brandName}", "${configName}", "${configKey}")`);
      const start1 = performance.now();
      let duration1 = 0;
      
      try {
        const response1 = await dinoconfig.configs.getConfigValue(
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

      // Show cache stats
      const stats1 = dinoconfig.cache.getStats();
      console.log(`\n   📊 Cache Stats: ${stats1.hits} hits, ${stats1.misses} misses, ${(stats1.hitRate * 100).toFixed(1)}% hit rate`);
      console.log();

      // Second request - should hit cache (cache hit)
      console.log('2️⃣ Second Request (Cache Hit Expected):');
      console.log(`   Calling: getConfigValue("${brandName}", "${configName}", "${configKey}")`);
      const start2 = performance.now();
      
      try {
        const response2 = await dinoconfig.configs.getConfigValue(
          brandName,
          configName,
          configKey
        );
        const duration2 = performance.now() - start2;

        if (response2.success) {
          console.log(`   ✓ Request successful in ${duration2.toFixed(2)}ms (from cache!)`);
          console.log(`   Config value: ${JSON.stringify(response2.data, null, 2)}`);
          console.log(`   ⚡ Speed improvement: ${((duration1 - duration2) / duration1 * 100).toFixed(1)}% faster`);
        } else {
          console.log('   ✗ Request failed');
          console.log(`   Message: ${response2.message || 'Unknown error'}`);
        }
      } catch (error: any) {
        const duration2 = performance.now() - start2;
        console.log(`   ✗ Error after ${duration2.toFixed(2)}ms:`);
        console.log(`     Message: ${error.message || 'Unknown error'}`);
      }

      // Show updated cache stats
      const stats2 = dinoconfig.cache.getStats();
      console.log(`\n   📊 Cache Stats: ${stats2.hits} hits, ${stats2.misses} misses, ${(stats2.hitRate * 100).toFixed(1)}% hit rate`);
      console.log();

      // Third request - force refresh (bypass cache)
      console.log('3️⃣ Third Request (Force Refresh - Bypass Cache):');
      console.log(`   Calling: getConfigValue("${brandName}", "${configName}", "${configKey}", { forceRefresh: true })`);
      const start3 = performance.now();
      
      try {
        const response3 = await dinoconfig.configs.getConfigValue(
          brandName,
          configName,
          configKey,
          { forceRefresh: true }
        );
        const duration3 = performance.now() - start3;

        if (response3.success) {
          console.log(`   ✓ Request successful in ${duration3.toFixed(2)}ms (from network)`);
          console.log(`   Config value: ${JSON.stringify(response3.data, null, 2)}`);
        } else {
          console.log('   ✗ Request failed');
          console.log(`   Message: ${response3.message || 'Unknown error'}`);
        }
      } catch (error: any) {
        const duration3 = performance.now() - start3;
        console.log(`   ✗ Error after ${duration3.toFixed(2)}ms:`);
        console.log(`     Message: ${error.message || 'Unknown error'}`);
      }

      // Show final cache stats
      const stats3 = dinoconfig.cache.getStats();
      console.log(`\n   📊 Cache Stats: ${stats3.hits} hits, ${stats3.misses} misses, ${(stats3.hitRate * 100).toFixed(1)}% hit rate`);
      console.log();

      // Demonstrate cache invalidation
      console.log('4️⃣ Cache Invalidation Test:');
      console.log('   Invalidating cache for pattern: "config:*"');
      await dinoconfig.cache.invalidate('config:*');
      console.log('   ✓ Cache invalidated');

      // Request after invalidation - should hit network again
      console.log(`\n   Calling: getConfigValue("${brandName}", "${configName}", "${configKey}")`);
      const start4 = performance.now();
      
      try {
        const response4 = await dinoconfig.configs.getConfigValue(
          brandName,
          configName,
          configKey
        );
        const duration4 = performance.now() - start4;

        if (response4.success) {
          console.log(`   ✓ Request successful in ${duration4.toFixed(2)}ms (from network after invalidation)`);
        } else {
          console.log('   ✗ Request failed');
          console.log(`   Message: ${response4.message || 'Unknown error'}`);
        }
      } catch (error: any) {
        const duration4 = performance.now() - start4;
        console.log(`   ✗ Error after ${duration4.toFixed(2)}ms:`);
        console.log(`     Message: ${error.message || 'Unknown error'}`);
      }

      // Show final cache stats
      const stats4 = dinoconfig.cache.getStats();
      console.log(`\n   📊 Final Cache Stats: ${stats4.hits} hits, ${stats4.misses} misses, ${(stats4.hitRate * 100).toFixed(1)}% hit rate`);
      console.log();

      // Cache control examples
      console.log('=========================================');
      console.log('Cache Control Examples');
      console.log('=========================================');
      console.log('// Clear all cache:');
      console.log('await dinoconfig.cache.clear();');
      console.log();
      console.log('// Invalidate specific pattern:');
      console.log('await dinoconfig.cache.invalidate("brand:Paysafe:*");');
      console.log();
      console.log('// Get cache statistics:');
      console.log('const stats = dinoconfig.cache.getStats();');
      console.log(`// Current: ${stats4.hits} hits, ${stats4.misses} misses, ${(stats4.hitRate * 100).toFixed(1)}% hit rate`);
      console.log();
      console.log('// Prefetch into cache:');
      console.log('await dinoconfig.cache.prefetch("key", async () => {');
      console.log('  return await dinoconfig.configs.getConfigValue(...);');
      console.log('});');
      console.log();

      // Show example usage with cache
      console.log('=========================================');
      console.log('Example: SDK Usage with Cache');
      console.log('=========================================');
      console.log('// Initialize SDK with cache enabled:');
      console.log('const dinoconfig = await dinoconfigApi({');
      console.log('  apiKey: "your-api-key",');
      console.log('  baseUrl: "https://api.dinoconfig.com",');
      console.log('  timeout: 10000,');
      console.log('  cache: {');
      console.log('    enabled: true,');
      console.log('    ttl: 60000,        // 1 minute');
      console.log('    maxSize: 1000,');
      console.log('    storage: "localStorage",');
      console.log('  }');
      console.log('});');
      console.log();
      console.log('// Get config value (automatically cached):');
      console.log('const response = await dinoconfig.configs.getConfigValue("mybrand", "myconfig", "mykey");');
      console.log();
      console.log('// Force refresh (bypass cache):');
      console.log('const response = await dinoconfig.configs.getConfigValue("mybrand", "myconfig", "mykey", {');
      console.log('  forceRefresh: true');
      console.log('});');
      console.log();
      console.log('// Disable cache for specific request:');
      console.log('const response = await dinoconfig.configs.getConfigValue("mybrand", "myconfig", "mykey", {');
      console.log('  cache: false');
      console.log('});');
      console.log();

      console.log('=========================================');
      console.log('Demo Complete!');
      console.log('=========================================');
      console.log('\nTo use the SDK in your application:');
      console.log('1. Install: npm install @dinoconfig/dinoconfig-js-sdk');
      console.log('2. Import: import { dinoconfigApi } from "@dinoconfig/dinoconfig-js-sdk";');
      console.log('3. Initialize: const dinoconfig = await dinoconfigApi({ apiKey: "your-api-key" });');
      console.log('4. Get config value: const response = await dinoconfig.configs.getConfigValue(brandName, configName, key);');
      console.log('\nSee README.md for complete documentation.');
    } catch (error: any) {
      console.error('✗ Error during SDK initialization:');
      console.error(`  Message: ${error.message || 'Unknown error'}`);
      if (error.stack) {
        console.error(`  Stack: ${error.stack}`);
      }
      process.exit(1);
    }
  }
}

/**
 * Parse command line arguments with prefixes
 */
function parseArgs(args: string[]): { apiKey?: string; baseUrl?: string } {
  const parsed: { apiKey?: string; baseUrl?: string } = {};

  for (const arg of args) {
    if (arg.startsWith('--api-key=')) {
      parsed.apiKey = arg.substring('--api-key='.length);
    } else if (arg.startsWith('--baseUrl=')) {
      parsed.baseUrl = arg.substring('--baseUrl='.length);
    } else if (arg.startsWith('--base-url=')) {
      // Support both camelCase and kebab-case
      parsed.baseUrl = arg.substring('--base-url='.length);
    }
  }

  return parsed;
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse named arguments
  const { apiKey, baseUrl } = parseArgs(args);

  // Check if API key is provided
  if (!apiKey) {
    console.log('Usage: npm start -- --api-key=YOUR_API_KEY [--baseUrl=YOUR_BASE_URL]');
    console.log('\nExample:');
    console.log('  npm start -- --api-key=dino_your-api-key-here');
    console.log('  npm start -- --api-key=dino_your-api-key-here --baseUrl=https://api.dinoconfig.com');
    console.log('\nOr with tsx:');
    console.log('  npm run dev -- --api-key=dino_your-api-key-here');
    console.log('  npm run dev -- --api-key=dino_your-api-key-here --baseUrl=http://localhost:3000');
    process.exit(1);
  }

  try {
    const demo = new DinoConfigJSDemo();
    await demo.runDemo(apiKey, baseUrl);
  } catch (error: any) {
    console.error('Error running demo:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the demo
main();

