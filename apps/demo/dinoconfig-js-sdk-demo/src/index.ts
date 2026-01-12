import { dinoconfigApi } from '@dinoconfig/dinoconfig-js-sdk';
import type { BrandInfo, ConfigInfo, FieldSchema, KeyInfo, ConfigInfoDetail, BrandInfoDetail } from '@dinoconfig/dinoconfig-js-sdk';

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
      // Initialize SDK with single factory function (like Shopify SDK pattern)
      console.log('Initializing SDK...');
      const dinoconfig = await dinoconfigApi({
        apiKey,
        baseUrl: baseUrl || 'http://localhost:3000',
        timeout: 10000,
      });
      console.log('✓ SDK initialized successfully\n');

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
      console.log('Configs API:');
      console.log('  ✓ dinoconfig.configs.getConfigValue(brandName, configName, configValueKey)');
      console.log();
      console.log('Discovery API (NEW):');
      console.log('  ✓ dinoconfig.discovery.listBrands()');
      console.log('  ✓ dinoconfig.discovery.listConfigs(brandName)');
      console.log('  ✓ dinoconfig.discovery.getSchema(brandName, configName)');
      console.log('  ✓ dinoconfig.discovery.introspect()');
      console.log();

      // Demonstrate Discovery API - List Brands
      console.log('=========================================');
      console.log('Discovery API: List Brands');
      console.log('=========================================');
      console.log('Calling: dinoconfig.discovery.listBrands()');
      
      try {
        const brandsResponse = await dinoconfig.discovery.listBrands();
        
        if (brandsResponse.success) {
          console.log('✓ Request successful!');
          console.log(`Found ${brandsResponse.data.length} brand(s):\n`);
          brandsResponse.data.forEach((brand: BrandInfo, index: number) => {
            console.log(`  ${index + 1}. ${brand.name}`);
            if (brand.description) {
              console.log(`     Description: ${brand.description}`);
            }
            console.log(`     Configs: ${brand.configCount}`);
            console.log(`     Created: ${brand.createdAt}`);
            console.log();
          });
        } else {
          console.log('✗ Request failed');
          console.log(`Message: ${brandsResponse.message || 'Unknown error'}`);
        }
      } catch (error: any) {
        console.log('✗ Error listing brands:');
        console.log(`  Message: ${error.message || 'Unknown error'}`);
        console.log('  This is expected if you don\'t have valid credentials.');
      }
      console.log();

      // Demonstrate Discovery API - List Configs
      console.log('=========================================');
      console.log('Discovery API: List Configs for Brand');
      console.log('=========================================');
      console.log('Calling: dinoconfig.discovery.listConfigs("Paysafe")');
      
      try {
        const configsResponse = await dinoconfig.discovery.listConfigs('Paysafe');
        
        if (configsResponse.success) {
          console.log('✓ Request successful!');
          console.log(`Found ${configsResponse.data.length} config(s):\n`);
          configsResponse.data.forEach((config: ConfigInfo, index: number) => {
            console.log(`  ${index + 1}. ${config.name} (v${config.version})`);
            if (config.description) {
              console.log(`     Description: ${config.description}`);
            }
            console.log(`     Keys: ${config.keys.length} [${config.keys.slice(0, 3).join(', ')}${config.keys.length > 3 ? '...' : ''}]`);
            console.log(`     Created: ${config.createdAt}`);
            console.log();
          });
        } else {
          console.log('✗ Request failed');
          console.log(`Message: ${configsResponse.message || 'Unknown error'}`);
        }
      } catch (error: any) {
        console.log('✗ Error listing configs:');
        console.log(`  Message: ${error.message || 'Unknown error'}`);
        console.log('  This is expected if the brand doesn\'t exist or you don\'t have access.');
      }
      console.log();

      // Demonstrate Discovery API - Get Schema
      console.log('=========================================');
      console.log('Discovery API: Get Config Schema');
      console.log('=========================================');
      console.log('Calling: dinoconfig.discovery.getSchema("Paysafe", "MyConfig")');
      
      try {
        const schemaResponse = await dinoconfig.discovery.getSchema('Paysafe', 'MyConfig');
        
        if (schemaResponse.success) {
          console.log('✓ Request successful!');
          console.log(`Config: ${schemaResponse.data.configName} (v${schemaResponse.data.version})`);
          console.log(`Fields: ${Object.keys(schemaResponse.data.fields).length}\n`);
          
          Object.entries(schemaResponse.data.fields).forEach(([name, field]: [string, FieldSchema]) => {
            console.log(`  • ${name}: ${field.type}`);
            if (field.description) {
              console.log(`    Description: ${field.description}`);
            }
            if (field.required) {
              console.log(`    Required: ${field.required}`);
            }
          });
        } else {
          console.log('✗ Request failed');
          console.log(`Message: ${schemaResponse.message || 'Unknown error'}`);
        }
      } catch (error: any) {
        console.log('✗ Error getting schema:');
        console.log(`  Message: ${error.message || 'Unknown error'}`);
        console.log('  This is expected if the config doesn\'t exist.');
      }
      console.log();

      // Demonstrate Discovery API - Full Introspection
      console.log('=========================================');
      console.log('Discovery API: Full Introspection');
      console.log('=========================================');
      console.log('Calling: dinoconfig.discovery.introspect()');
      
      try {
        const introspectResponse = await dinoconfig.discovery.introspect();
        
        if (introspectResponse.success) {
          console.log('✓ Request successful!');
          console.log(`Company: ${introspectResponse.data.company}`);
          console.log(`Brands: ${introspectResponse.data.brands.length}`);
          console.log(`Generated at: ${introspectResponse.data.generatedAt}\n`);
          
          introspectResponse.data.brands.forEach((brand: BrandInfoDetail, brandIndex: number) => {
            console.log(`Brand ${brandIndex + 1}: ${brand.name}`);
            if (brand.description) {
              console.log(`  Description: ${brand.description}`);
            }
            console.log(`  Configs: ${brand.configs.length}\n`);
            
            brand.configs.forEach((config: ConfigInfoDetail, configIndex: number) => {
              console.log(`    Config ${configIndex + 1}: ${config.name} (v${config.version})`);
              if (config.description) {
                console.log(`      Description: ${config.description}`);
              }
              console.log(`      Keys: ${config.keys.length}`);
              if (config.keys.length > 0) {
                console.log(`      Sample keys:`);
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
          console.log('✗ Request failed');
          console.log(`Message: ${introspectResponse.message || 'Unknown error'}`);
        }
      } catch (error: any) {
        console.log('✗ Error during introspection:');
        console.log(`  Message: ${error.message || 'Unknown error'}`);
        console.log('  This is expected if you don\'t have valid credentials.');
      }
      console.log();

      // Demonstrate configuration value retrieval
      console.log('=========================================');
      console.log('Configs API: Retrieving Configuration Value');
      console.log('=========================================');
      console.log('Calling: dinoconfig.configs.getConfigValue("Paysafe", "MyConfig", "test")');
      
      try {
        const response = await dinoconfig.configs.getConfigValue(
          'Paysafe',
          'MyConfig',
          'test',
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
      console.log('Example: SDK Usage Patterns');
      console.log('=========================================');
      console.log('// Initialize SDK with a single function call:');
      console.log('// const dinoconfig = await dinoconfigApi({');
      console.log('//   apiKey: "your-api-key",');
      console.log('//   baseUrl: "https://api.dinoconfig.com",');
      console.log('//   timeout: 10000');
      console.log('// });');
      console.log('//');
      console.log('// Discovery API - List brands:');
      console.log('// const brands = await dinoconfig.discovery.listBrands();');
      console.log('//');
      console.log('// Discovery API - List configs:');
      console.log('// const configs = await dinoconfig.discovery.listConfigs("MyBrand");');
      console.log('//');
      console.log('// Discovery API - Get schema:');
      console.log('// const schema = await dinoconfig.discovery.getSchema("MyBrand", "MyConfig");');
      console.log('//');
      console.log('// Discovery API - Full introspection:');
      console.log('// const all = await dinoconfig.discovery.introspect();');
      console.log('//');
      console.log('// Configs API - Get config value:');
      console.log('// const response = await dinoconfig.configs.getConfigValue("mybrand", "myconfig", "mykey");');
      console.log('// if (response.success) {');
      console.log('//   console.log("Config value:", response.data);');
      console.log('// }');
      console.log();

      console.log('=========================================');
      console.log('Demo Complete!');
      console.log('=========================================');
      console.log('\nTo use the SDK in your application:');
      console.log('1. Install: npm install @dinoconfig/dinoconfig-js-sdk');
      console.log('2. Import: import { dinoconfigApi } from "@dinoconfig/dinoconfig-js-sdk";');
      console.log('3. Initialize: const dinoconfig = await dinoconfigApi({ apiKey: "your-api-key" });');
      console.log('4. Discover brands: const brands = await dinoconfig.discovery.listBrands();');
      console.log('5. Discover configs: const configs = await dinoconfig.discovery.listConfigs(brandName);');
      console.log('6. Get config value: const response = await dinoconfig.configs.getConfigValue(brandName, configName, key);');
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
