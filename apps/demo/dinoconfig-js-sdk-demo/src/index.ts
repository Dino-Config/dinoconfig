import { DinoConfigSDK } from '@dinoconfig/dinoconfig-js-sdk';

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

    // Create SDK instance
    const sdk = new DinoConfigSDK();
    
    try {
      if (baseUrl) {
        console.log('Initializing SDK with API key and custom base URL...');
        await sdk.configure({
          apiKey,
          baseUrl,
          timeout: 10000,
        });
      } else {
        console.log('Initializing SDK with API key...');
        await sdk.configure({
          apiKey,
          baseUrl: 'http://localhost:3000',
          timeout: 10000,
        });
      }
      console.log('✓ SDK initialized successfully\n');

      // Get ConfigAPI instance
      const configAPI = sdk.getConfigAPI();
      console.log('✓ ConfigAPI instance created\n');

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
      console.log('✓ getConfigValue(brandName, configName, configValueKey)');
      console.log();

      // Demonstrate configuration value retrieval
      console.log('=========================================');
      console.log('Retrieving Configuration Value');
      console.log('=========================================');
      console.log('Calling: configAPI.getConfigValue("Orden", "RiskDetails", "isRiskEnabled")');
      
      try {
        const response = await configAPI.getConfigValue(
          'Brand2',
          'Test2',
          'countries',
          {}
        );

        if (response.success) {
          console.log('✓ Request successful!');
          console.log(`Config value: ${JSON.stringify(response.data, null, 2)}`);
        } else {
          console.log('✗ Request failed');
          console.log(`Message: ${response.message || 'Unknown error'}`);
        }
      } catch (error: any) {
        console.log('✗ Error retrieving config value:');
        console.log(`  Message: ${error.message || 'Unknown error'}`);
        console.log('  This is expected if you don\'t have valid credentials or the config doesn\'t exist.');
      }
      console.log();

      // Show example usage
      console.log('=========================================');
      console.log('Example: Retrieving Configuration Value');
      console.log('=========================================');
      console.log('// Example usage:');
      console.log('// const sdk = new DinoConfigSDK();');
      console.log('// await sdk.configure({ apiKey: "your-api-key", baseUrl: "https://api.dinoconfig.com" });');
      console.log('// const configAPI = sdk.getConfigAPI();');
      console.log('// const response = await configAPI.getConfigValue("mybrand", "myconfig", "mykey");');
      console.log('// if (response.success) {');
      console.log('//   console.log("Config value:", response.data);');
      console.log('// }');
      console.log();

      console.log('=========================================');
      console.log('Demo Complete!');
      console.log('=========================================');
      console.log('\nTo use the SDK in your application:');
      console.log('1. Install: npm install @dinoconfig/dinoconfig-js-sdk');
      console.log('2. Import: import { DinoConfigSDK } from "@dinoconfig/dinoconfig-js-sdk";');
      console.log('3. Create instance: const sdk = new DinoConfigSDK();');
      console.log('4. Configure: await sdk.configure({ apiKey: "your-api-key" });');
      console.log('5. Get API: const configAPI = sdk.getConfigAPI();');
      console.log('6. Get config value: const response = await configAPI.getConfigValue(brandName, configName, key);');
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

