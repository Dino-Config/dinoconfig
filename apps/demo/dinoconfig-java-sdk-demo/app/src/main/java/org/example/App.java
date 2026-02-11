package org.example;

import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;
import com.dinoconfig.sdk.DinoConfigJavaSDK;
import com.dinoconfig.sdk.api.ConfigAPI;
import com.dinoconfig.sdk.api.DiscoveryAPI;
import com.dinoconfig.sdk.model.*;

// Import generated model classes
import org.example.models.test.Test3;

import java.io.IOException;
import java.util.List;

/**
 * Demo application showcasing the DinoConfig Java SDK.
 *
 * <p>This demo demonstrates:
 * <ul>
 *   <li>SDK initialization with factory methods</li>
 *   <li>Retrieving entire configurations with {@link ConfigAPI#get(String, String)}</li>
 *   <li>Retrieving typed configurations with {@link ConfigAPI#getAs(String, String, Class)}</li>
 *   <li>Retrieving single values with type safety: {@link ConfigAPI#getValue(String, Class)}</li>
 *   <li>Using path-based shorthand notation</li>
 *   <li>Using generated model classes for type-safe configuration access</li>
 *   <li>Discovery API for exploring brands and configs</li>
 *   <li>Full introspection capabilities</li>
 * </ul>
 */
public class App {

    /**
     * Main method to run the demo
     */
    public static void main(String[] args) {
        App app = new App();
      
        // Check if API key is provided
        if (args.length == 0) {
            System.out.println("Usage: java App <api-key> [base-url]");
            System.out.println("\nExample:");
            System.out.println("  java App dino_your-api-key-here");
            System.out.println("  java App dino_your-api-key-here https://api.dinoconfig.com");
            System.exit(1);
        }

        String apiKey = args[0];
        String baseUrl = args.length > 1 ? args[1] : null;

        try {
            app.runDemo(apiKey, baseUrl);
        } catch (Exception e) {
            System.err.println("Error running demo: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    /**
     * Run the SDK demo
     */
    private void runDemo(String apiKey, String baseUrl) throws IOException {
        System.out.println("=========================================");
        System.out.println("DinoConfig Java SDK Demo (v2.0 API)");
        System.out.println("=========================================\n");

        // Initialize SDK using factory method
        System.out.println("Step 1: Initializing SDK...");
        DinoConfigSDK sdk;
        if (baseUrl != null) {
            System.out.println("  → Using custom base URL: " + baseUrl);
            sdk = DinoConfigSDKFactory.create(apiKey, baseUrl);
        } else {
            System.out.println("  → Using default base URL: https://api.dinoconfig.com");
            sdk = DinoConfigSDKFactory.create(apiKey);
        }
        System.out.println("  ✓ SDK initialized successfully\n");

        // Display SDK information
        System.out.println("=========================================");
        System.out.println("SDK Information");
        System.out.println("=========================================");
        System.out.println("SDK Name: " + DinoConfigJavaSDK.getName());
        System.out.println("SDK Version: " + DinoConfigJavaSDK.getVersion());
        System.out.println();

        // Get API instances
        ConfigAPI configAPI = sdk.getConfigAPI();
        DiscoveryAPI discoveryAPI = sdk.getDiscoveryAPI();

        // Demonstrate Discovery API
        demonstrateDiscoveryAPI(discoveryAPI);

        // Demonstrate Config API - Getting entire config
        demonstrateConfigRetrieval(configAPI);

        // Demonstrate Config API - Using typed models (generated classes)
        demonstrateTypedModels(configAPI);

        // Demonstrate Config API - Getting single values with type safety
        demonstrateTypedValueRetrieval(configAPI);

        // Demonstrate path-based shorthand
        demonstratePathShorthand(configAPI);

        System.out.println("=========================================");
        System.out.println("Demo Complete!");
        System.out.println("=========================================");
        System.out.println("\nQuick Start Guide (v2.0 Simplified API):");
        System.out.println("1. Initialize: DinoConfigSDK sdk = DinoConfigSDKFactory.create(\"your-api-key\");");
        System.out.println("2. Get entire config: ConfigData config = sdk.getConfigAPI().get(\"Brand\", \"Config\");");
        System.out.println("3. Get typed config: MyConfig config = sdk.getConfigAPI().getAs(\"Brand\", \"Config\", MyConfig.class);");
        System.out.println("4. Get single value: String value = sdk.getConfigAPI().getValue(\"Brand.Config.key\", String.class);");
        System.out.println("5. Explore: List<BrandInfo> brands = sdk.getDiscoveryAPI().listBrands();");
        System.out.println("\nGenerate type-safe models:");
        System.out.println("  npx @dinoconfig/cli javagen --api-key=YOUR_KEY --output=./src/main/java/your/package");
        System.out.println("\nSee README.md for complete documentation.");
    }

    /**
     * Demonstrates the Discovery API capabilities
     */
    private void demonstrateDiscoveryAPI(DiscoveryAPI discoveryAPI) throws IOException {
        System.out.println("=========================================");
        System.out.println("Discovery API - Exploring Configurations");
        System.out.println("=========================================");

        // List all brands - returns List<BrandInfo> directly!
        System.out.println("\n1. Listing all brands...");
        List<BrandInfo> brands = discoveryAPI.listBrands();
        System.out.println("   ✓ Found " + brands.size() + " brand(s):");
        for (BrandInfo brand : brands) {
            String description = brand.getDescription();
            System.out.println("     - " + brand.getName() +
                (description != null && !description.isEmpty() ? " (" + description + ")" : "") +
                " - " + brand.getConfigCount() + " config(s)");
        }

        // List configs for a specific brand - returns List<ConfigInfo> directly!
        System.out.println("\n2. Listing configs for brand 'Test'...");
        List<ConfigInfo> configs = discoveryAPI.listConfigs("Test");
        System.out.println("   ✓ Found " + configs.size() + " config(s):");
        for (ConfigInfo config : configs) {
            System.out.println("     - " + config.getName() + " (v" + config.getVersion() + ") - " + config.getKeys().size() + " key(s)");
        }

        // Get schema for a config - returns ConfigSchema directly!
        System.out.println("\n3. Getting schema for 'Test.Test3'...");
        ConfigSchema schema = discoveryAPI.getSchema("Test", "Test3");
        System.out.println("   ✓ Schema retrieved");
        System.out.println("     Config: " + schema.getConfigName() + " (v" + schema.getVersion() + ")");
        if (schema.getFields() != null) {
            System.out.println("     Fields:");
            schema.getFields().forEach((name, field) -> {
                System.out.println("       - " + name + ": " + field.getType() + (field.isRequired() ? " (required)" : ""));
            });
        }

        // Full introspection - returns IntrospectionResult directly!
        System.out.println("\n4. Performing full introspection...");
        IntrospectionResult result = discoveryAPI.introspect();
        System.out.println("   ✓ Introspection complete");
        System.out.println("     Company: " + result.getCompany());
        System.out.println("     Total brands: " + result.getBrandCount());
        System.out.println("     Total configs: " + result.getTotalConfigCount());
        System.out.println("     Total keys: " + result.getTotalKeyCount());

        System.out.println();
    }

    /**
     * Demonstrates retrieving entire configurations
     */
    private void demonstrateConfigRetrieval(ConfigAPI configAPI) throws IOException {
        System.out.println("=========================================");
        System.out.println("Config API - Retrieving Configurations");
        System.out.println("=========================================");

        System.out.println("\nNew simplified API (v2.0):");
        System.out.println("  ConfigData config = configAPI.get(\"Brand\", \"Config\");");
        System.out.println("  Map<String, Object> values = config.getValues();");
        System.out.println("  String theme = config.getValue(\"theme\", String.class);");
        System.out.println();

        // Get config - returns ConfigData directly!
        System.out.println("Fetching 'Test.Test3' configuration...");
        ConfigData config = configAPI.get("Test", "Test3");
        System.out.println("  ✓ Config retrieved: " + config.getName() + " (v" + config.getVersion() + ")");
        System.out.println("  ✓ Values: " + config.getValues());

        System.out.println();
    }

    /**
     * Demonstrates using typed model classes for type-safe configuration access.
     */
    private void demonstrateTypedModels(ConfigAPI configAPI) throws IOException {
        System.out.println("=========================================");
        System.out.println("Config API - Type-Safe Models");
        System.out.println("=========================================");

        System.out.println("\nNew simplified API (v2.0):");
        System.out.println("  // Get config directly as your model type");
        System.out.println("  MyConfig config = configAPI.getAs(\"Demo\", \"MyConfig\", MyConfig.class);");
        System.out.println("  String test = config.getTest();  // Type-safe, no casting!");
        System.out.println();

        // Get typed model - returns Test3 directly!
        System.out.println("Fetching 'Test.Test3' as typed Test3 model...");
        Test3 typedConfig = configAPI.getAs("Test", "Test3", Test3.class);
        System.out.println("  ✓ Config retrieved with type safety!");
        System.out.println("    - config.getTime_1(): " + typedConfig.getTime_1());
        System.out.println("    - config.getDatetime_1(): " + typedConfig.getDatetime_1());
        System.out.println("    - config.getText(): " + typedConfig.getText());

        System.out.println();
    }

    /**
     * Demonstrates retrieving single configuration values with type safety
     */
    private void demonstrateTypedValueRetrieval(ConfigAPI configAPI) throws IOException {
        System.out.println("=========================================");
        System.out.println("Config API - Type-Safe Value Retrieval");
        System.out.println("=========================================");

        System.out.println("\nNew simplified API (v2.0):");
        System.out.println("  // Get a value with type safety - no casting needed!");
        System.out.println("  String theme = configAPI.getValue(\"Brand.Config.theme\", String.class);");
        System.out.println("  Integer count = configAPI.getValue(\"Brand.Config.count\", Integer.class);");
        System.out.println("  Boolean flag = configAPI.getValue(\"Brand.Config.enabled\", Boolean.class);");
        System.out.println();

        // Get typed value - returns the value directly!
        System.out.println("Fetching 'Test.Test3.text' as String...");
        String textValue = configAPI.getValue("Test", "Test3", "text", String.class);
        System.out.println("  ✓ Value retrieved: " + textValue);

        // Using path shorthand
        System.out.println("\nFetching 'Test.Test3.text' using path shorthand...");
        String pathValue = configAPI.getValue("Test.Test3.text", String.class);
        System.out.println("  ✓ Value retrieved: " + pathValue);

        System.out.println();
    }

    /**
     * Demonstrates path-based shorthand notation
     */
    private void demonstratePathShorthand(ConfigAPI configAPI) throws IOException {
        System.out.println("=========================================");
        System.out.println("Path-Based Shorthand Notation");
        System.out.println("=========================================");

        System.out.println("\nUse dot-separated paths for concise code:");
        System.out.println();

        System.out.println("Get entire config:");
        System.out.println("  ConfigData config = configAPI.get(\"Brand.Config\");");
        
        ConfigData pathConfig = configAPI.get("Test.Test3");
        System.out.println("  → Result: " + pathConfig.getName() + " with " + pathConfig.getValues().size() + " values");
        System.out.println();

        System.out.println("Get typed config:");
        System.out.println("  MyConfig config = configAPI.getAs(\"Brand.Config\", MyConfig.class);");
        
        Test3 pathTypedConfig = configAPI.getAs("Test.Test3", Test3.class);
        System.out.println("  → Result: text=" + pathTypedConfig.getText());
        System.out.println();

        System.out.println("Get single value:");
        System.out.println("  String value = configAPI.getValue(\"Brand.Config.key\", String.class);");
        
        String pathValue = configAPI.getValue("Test.Test3.text", String.class);
        System.out.println("  → Result: " + pathValue);
        System.out.println();

        System.out.println("Path formats:");
        System.out.println("  • Config: \"BrandName.ConfigName\"");
        System.out.println("  • Value:  \"BrandName.ConfigName.KeyName\"");
        System.out.println();
    }
}
