/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk;

import com.dinoconfig.sdk.api.ConfigAPI;
import com.dinoconfig.sdk.http.HttpClient;
import com.dinoconfig.sdk.model.DinoConfigSDKConfig;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Main DinoConfig SDK class providing access to the DinoConfig API.
 * 
 * <p>This class is the central entry point for interacting with the DinoConfig
 * configuration management system. It manages authentication, HTTP communication,
 * and provides access to API modules.
 * 
 * <p><b>Recommended Usage:</b> Use {@link DinoConfigSDKFactory} to create instances
 * rather than instantiating this class directly.
 * 
 * <pre>{@code
 * // Recommended: Use factory
 * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");
 * 
 * // Get configuration values
 * ConfigAPI configAPI = dinoconfig.getConfigAPI();
 * ApiResponse<Object> response = configAPI.getConfigValue(
 *     "mybrand", "myconfig", "mykey", new RequestOptions()
 * );
 * 
 * if (response.getSuccess()) {
 *     System.out.println("Value: " + response.getData());
 * }
 * }</pre>
 * 
 * <p><b>Thread Safety:</b> Once configured, the SDK instance is thread-safe
 * and can be shared across multiple threads.
 * 
 * <p><b>Lifecycle:</b>
 * <ol>
 *   <li>Create instance (via factory or constructor)</li>
 *   <li>Configure with API key</li>
 *   <li>Use API methods</li>
 *   <li>No explicit cleanup required</li>
 * </ol>
 * 
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 * @see DinoConfigSDKFactory
 * @see ConfigAPI
 */
public class DinoConfigSDK {
    
    /** The HTTP client for making API requests */
    private HttpClient httpClient;
    
    /** The Configuration API instance */
    private ConfigAPI configAPI;
    
    /**
     * Default constructor.
     * 
     * <p><b>Note:</b> After construction, you must call {@link #configure(DinoConfigSDKConfig)}
     * before using any API methods. It is recommended to use {@link DinoConfigSDKFactory}
     * instead of calling this constructor directly.
     * 
     * @see DinoConfigSDKFactory#create(String)
     */
    public DinoConfigSDK() {
        // Default constructor
    }
    
    /**
     * Configures the SDK with the provided configuration.
     * 
     * <p>This method initializes the HTTP client, exchanges the API key for an
     * access token, and sets up the API modules. It must be called before using
     * any API methods.
     * 
     * <p><b>What happens during configuration:</b>
     * <ol>
     *   <li>HTTP client is initialized with base URL and timeout</li>
     *   <li>API key is exchanged for an access token</li>
     *   <li>Authorization headers are configured</li>
     *   <li>API modules (ConfigAPI) are initialized</li>
     * </ol>
     * 
     * <p><b>Example:</b>
     * <pre>{@code
     * DinoConfigSDK sdk = new DinoConfigSDK();
     * 
     * DinoConfigSDKConfig config = new DinoConfigSDKConfig();
     * config.setApiKey("dino_your-api-key");
     * config.setBaseUrl("https://api.dinoconfig.com");
     * 
     * sdk.configure(config);
     * 
     * // Now the SDK is ready to use
     * ConfigAPI configAPI = sdk.getConfigAPI();
     * }</pre>
     * 
     * @param config The SDK configuration containing API key and other settings
     * @throws IOException if the API key exchange fails due to network issues
     *                     or invalid credentials
     * @throws IllegalArgumentException if the API key is null or empty
     * @see DinoConfigSDKConfig
     */
    public void configure(DinoConfigSDKConfig config) throws IOException {
        String apiKey = config.getApiKey();
        String baseUrl = config.getBaseUrl() != null ? config.getBaseUrl() : "http://localhost:3000";
        Long timeout = config.getTimeout() != null ? config.getTimeout() : 10000L;
        
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("API key is required");
        }
        
        // Initialize HTTP client
        this.httpClient = new HttpClient(baseUrl, timeout);
        
        // Configure authentication
        Map<String, String> headers = new HashMap<>();
        headers.put("X-API-Key", apiKey);
        this.httpClient.configureAuthorizationHeader(headers);
        
        // Initialize API modules
        this.configAPI = new ConfigAPI(this.httpClient);
    }
    
    /**
     * Returns the Configuration API instance for retrieving configuration values.
     * 
     * <p>The ConfigAPI provides methods for fetching configuration values from
     * the DinoConfig service.
     * 
     * <p><b>Example:</b>
     * <pre>{@code
     * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");
     * ConfigAPI configAPI = dinoconfig.getConfigAPI();
     * 
     * // Get a configuration value
     * ApiResponse<Object> response = configAPI.getConfigValue(
     *     "MyBrand",
     *     "AppSettings",
     *     "theme",
     *     new RequestOptions()
     * );
     * 
     * if (response.getSuccess()) {
     *     String theme = (String) response.getData();
     *     System.out.println("Theme: " + theme);
     * }
     * }</pre>
     * 
     * @return The ConfigAPI instance for configuration value retrieval
     * @throws IllegalStateException if the SDK has not been configured yet
     *                               (i.e., {@link #configure(DinoConfigSDKConfig)} was not called)
     * @see ConfigAPI
     * @see ConfigAPI#getConfigValue(String, String, String, com.dinoconfig.sdk.model.RequestOptions)
     */
    public ConfigAPI getConfigAPI() {
        if (configAPI == null) {
            throw new IllegalStateException(
                "SDK is not configured. Call configure() first or use DinoConfigSDKFactory.create()."
            );
        }
        return configAPI;
    }
}
