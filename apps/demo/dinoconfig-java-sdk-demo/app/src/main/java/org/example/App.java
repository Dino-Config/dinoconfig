package org.example;

import com.dinoconfig.sdk.DinoConfigSDK;
import com.dinoconfig.sdk.DinoConfigSDKFactory;
import com.dinoconfig.sdk.DinoConfigJavaSDK;
import com.dinoconfig.sdk.api.ConfigAPI;
import com.dinoconfig.sdk.model.*;

import java.io.IOException;

/**
 * Demo application showcasing the DinoConfig Java SDK.
 * This demonstrates how to use the SDK to retrieve configuration values.
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
        
        // Create SDK instance
        DinoConfigSDK sdk;
        if (baseUrl != null) {
            System.out.println("Initializing SDK with API key and custom base URL...");
            sdk = DinoConfigSDKFactory.create(apiKey, baseUrl);
        } else {
            System.out.println("Initializing SDK with API key...");
            sdk = DinoConfigSDKFactory.create(apiKey);
        }
        System.out.println("✓ SDK initialized successfully\n");
        
        // Get ConfigAPI instance
        ConfigAPI configAPI = sdk.getConfigAPI();
        System.out.println("✓ ConfigAPI instance created\n");
        
        // Demonstrate configuration value retrieval
        System.out.println("=========================================");
        System.out.println("SDK Configuration Info");
        System.out.println("=========================================");
        System.out.println("SDK Name: " + DinoConfigJavaSDK.getName());
        System.out.println("SDK Version: " + DinoConfigJavaSDK.getVersion());
        System.out.println();
        
        // Show available API methods
        System.out.println("=========================================");
        System.out.println("Available API Methods");
        System.out.println("=========================================");
        System.out.println("✓ getConfigValue(brandName, configName, configValueKey)");
        System.out.println();

        ApiResponse<Object> response = configAPI.getConfigValue("DemoBrand", "MyConfig", "test", new RequestOptions());
        System.out.println("Config value: " + response.getData());
        
        // Demonstrate how to retrieve a configuration value
        System.out.println("=========================================");
        System.out.println("Example: Retrieving Configuration Value");
        System.out.println("=========================================");
        System.out.println("// Example usage:");
        System.out.println("// ApiResponse<Object> response = configAPI.getConfigValue(\"mybrand\", \"myconfig\", \"mykey\");");
        System.out.println("// if (response.getSuccess()) {");
        System.out.println("//     Object value = response.getData();");
        System.out.println("//     System.out.println(\"Config value: \" + value);");
        System.out.println("// }");
        System.out.println();
        
        System.out.println("=========================================");
        System.out.println("Demo Complete!");
        System.out.println("=========================================");
        System.out.println("\nTo use the SDK in your application:");
        System.out.println("1. Create an instance: DinoConfigSDK sdk = DinoConfigSDKFactory.create(\"your-api-key\");");
        System.out.println("2. Get the API: ConfigAPI api = sdk.getConfigAPI();");
        System.out.println("3. Get config value: ApiResponse<Object> response = api.getConfigValue(brandName, configName, key);");
        System.out.println("\nSee README.md for complete documentation.");
    }
}