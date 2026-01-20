package org.example;

import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;
import com.dinoconfig.sdk.DinoConfigJavaSDK;
import com.dinoconfig.sdk.api.ConfigAPI;
import com.dinoconfig.sdk.api.DiscoveryAPI;
import com.dinoconfig.sdk.model.*;

import java.io.IOException;
import java.util.List;

/**
 * Demo application showcasing the DinoConfig Java SDK.
 * 
 * <p>This demo demonstrates:
 * <ul>
 *   <li>SDK initialization with factory methods</li>
 *   <li>Retrieving entire configurations with {@link ConfigAPI#get(String, String)}</li>
 *   <li>Retrieving single values with {@link ConfigAPI#getValue(String, String, String)}</li>
 *   <li>Using path-based shorthand notation</li>
 *   <li>Discovery API for exploring brands and configs</li>
 *   <li>Full introspection capabilities</li>
 *   <li>Error handling and response checking</li>
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
        System.out.println("DinoConfig Java SDK Demo");
        System.out.println("=========================================\n");
        
        // Initialize SDK using factory method
        System.out.println("Step 1: Initializing SDK...");
        DinoConfigSDK sdk;
        if (baseUrl != null) {
            System.out.println("  → Using custom base URL: " + baseUrl);
            sdk = DinoConfigSDKFactory.create(apiKey, baseUrl);
        } else {
            System.out.println("  → Using default base URL: http://localhost:3000");
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
        
        // Demonstrate Config API - Getting single values
        demonstrateValueRetrieval(configAPI);
        
        // Demonstrate path-based shorthand
        demonstratePathShorthand(configAPI);
        
        System.out.println("=========================================");
        System.out.println("Demo Complete!");
        System.out.println("=========================================");
        System.out.println("\nQuick Start Guide:");
        System.out.println("1. Initialize: DinoConfigSDK sdk = DinoConfigSDKFactory.create(\"your-api-key\");");
        System.out.println("2. Get entire config: ApiResponse<ConfigData> config = sdk.getConfigAPI().get(\"Brand\", \"Config\");");
        System.out.println("3. Get single value: ApiResponse<Object> value = sdk.getConfigAPI().getValue(\"Brand\", \"Config\", \"key\");");
        System.out.println("4. Use path shorthand: ApiResponse<Object> value = sdk.getConfigAPI().getValue(\"Brand.Config.key\");");
        System.out.println("5. Explore: ApiResponse<List<BrandInfo>> brands = sdk.getDiscoveryAPI().listBrands();");
        System.out.println("\nSee README.md for complete documentation.");
    }
    
    /**
     * Demonstrates the Discovery API capabilities
     */
    private void demonstrateDiscoveryAPI(DiscoveryAPI discoveryAPI) throws IOException {
        System.out.println("=========================================");
        System.out.println("Discovery API - Exploring Configurations");
        System.out.println("=========================================");
        
        // List all brands
        System.out.println("\n1. Listing all brands...");
        ApiResponse<List<BrandInfo>> brandsResponse = discoveryAPI.listBrands();
        if (brandsResponse.getSuccess() && brandsResponse.getData() != null) {
            List<BrandInfo> brands = brandsResponse.getData();
            System.out.println("   ✓ Found " + brands.size() + " brand(s):");
            for (BrandInfo brand : brands) {
                String description = brand.getDescription();
                System.out.println("     - " + brand.getName() + 
                    (description != null && !description.isEmpty() ? " (" + description + ")" : "") +
                    " - " + brand.getConfigCount() + " config(s)");
            }
        } else {
            System.out.println("   ⚠ Could not retrieve brands: " + brandsResponse.getMessage());
        }
        
        // Full introspection
        System.out.println("\n2. Performing full introspection...");
        ApiResponse<IntrospectionResult> introspectionResponse = discoveryAPI.introspect();
        if (introspectionResponse.getSuccess() && introspectionResponse.getData() != null) {
            IntrospectionResult result = introspectionResponse.getData();
            System.out.println("   ✓ Introspection complete");
            System.out.println("     Company: " + result.getCompany());
            System.out.println("     Total brands: " + result.getBrandCount());
            System.out.println("     Total configs: " + result.getTotalConfigCount());
            System.out.println("     Total keys: " + result.getTotalKeyCount());
        } else {
            System.out.println("   ⚠ Could not perform introspection: " + introspectionResponse.getMessage());
        }
        
        System.out.println();
    }
    
    /**
     * Demonstrates retrieving entire configurations
     */
    private void demonstrateConfigRetrieval(ConfigAPI configAPI) throws IOException {
        System.out.println("=========================================");
        System.out.println("Config API - Retrieving Entire Configurations");
        System.out.println("=========================================");
        
        System.out.println("\nExample: Get entire configuration");
        System.out.println("  ApiResponse<ConfigData> response = configAPI.get(\"BrandName\", \"ConfigName\");");
        System.out.println("  if (response.getSuccess()) {");
        System.out.println("      ConfigData config = response.getData();");
        System.out.println("      Map<String, Object> values = config.getValues();");
        System.out.println("      String theme = config.getValue(\"theme\", String.class);");
        System.out.println("  }");
        System.out.println();
        
        // Try to get a config (will fail gracefully if it doesn't exist)
        System.out.println("Trying to retrieve a sample configuration...");
        // Note: This will only work if you have actual brands/configs configured
        System.out.println("  → Fetching config...");
        ApiResponse<ConfigData> configResponse = configAPI.get("Test", "Test3");
        if (configResponse.getSuccess()) {
            ConfigData config = configResponse.getData();
            System.out.println("  ✓ Config retrieved: " + config.getName() + " (v" + config.getVersion() + ")");
            System.out.println("  ✓ Values: " + config.getValues());
        } else {
            System.out.println("  ⚠ Config not found (this is expected if not configured)");
        }
        
        System.out.println();
    }
    
    /**
     * Demonstrates retrieving single configuration values
     */
    private void demonstrateValueRetrieval(ConfigAPI configAPI) throws IOException {
        System.out.println("=========================================");
        System.out.println("Config API - Retrieving Single Values");
        System.out.println("=========================================");
        
        System.out.println("\nExample 1: Get value with separate parameters");
        System.out.println("  ApiResponse<Object> response = configAPI.getValue(\"BrandName\", \"ConfigName\", \"keyName\");");
        System.out.println("  if (response.getSuccess()) {");
        System.out.println("      Object value = response.getData();");
        System.out.println("      // Cast to expected type");
        System.out.println("      String stringValue = (String) value;");
        System.out.println("      Boolean boolValue = (Boolean) value;");
        System.out.println("  }");
        System.out.println();
        
        System.out.println("Example 2: Get value with RequestOptions");
        System.out.println("  RequestOptions options = new RequestOptions();");
        System.out.println("  options.setTimeout(30000L);  // 30 second timeout");
        System.out.println("  options.setRetries(3);       // Retry up to 3 times");
        System.out.println("  ApiResponse<Object> response = configAPI.getValue(\"Brand\", \"Config\", \"key\", options);");
        System.out.println();
        
        // Try to get a value (will fail gracefully if it doesn't exist)
        System.out.println("Trying to retrieve a sample value...");
        // Note: This will only work if you have actual brands/configs/keys configured
        System.out.println("  → Fetching value...");
        ApiResponse<Object> valueResponse = configAPI.getValue("Test", "Test3", "time_1");
        if (valueResponse.getSuccess()) {
            System.out.println("  ✓ Value retrieved: " + valueResponse.getData());
        } else {
            System.out.println("  ⚠ Value not found (this is expected if not configured)");
        }
        
        System.out.println();
    }
    
    /**
     * Demonstrates path-based shorthand notation
     */
    private void demonstratePathShorthand(ConfigAPI configAPI) throws IOException {
        System.out.println("=========================================");
        System.out.println("Path-Based Shorthand Notation");
        System.out.println("=========================================");
        
        System.out.println("\nYou can use dot-separated paths for convenience:");
        System.out.println();
        
        System.out.println("Get entire config:");
        System.out.println("  // These are equivalent:");
        System.out.println("  ApiResponse<ConfigData> config1 = configAPI.get(\"Brand\", \"Config\");");
        System.out.println("  ApiResponse<ConfigData> config2 = configAPI.get(\"Brand.Config\");");
        System.out.println();
        
        System.out.println("Get single value:");
        System.out.println("  // These are equivalent:");
        System.out.println("  ApiResponse<Object> value1 = configAPI.getValue(\"Brand\", \"Config\", \"key\");");
        System.out.println("  ApiResponse<Object> value2 = configAPI.getValue(\"Brand.Config.key\");");
        System.out.println();
        
        System.out.println("Path format:");
        System.out.println("  • Config: \"BrandName.ConfigName\"");
        System.out.println("  • Value: \"BrandName.ConfigName.KeyName\"");
        System.out.println();
    }
}