package com.dinoconfig.sdk;

import com.dinoconfig.sdk.model.DinoConfigSDKConfig;

import java.io.IOException;

/**
 * Factory class for creating and configuring DinoConfig SDK instances.
 * Provides convenient methods for SDK instantiation.
 */
public class DinoConfigSDKFactory {
    
    /**
     * Create and configure a new DinoConfig SDK instance with the provided configuration.
     * 
     * The SDK will automatically exchange your API key for an access token
     * and handle token refresh automatically.
     * 
     * @param config SDK configuration containing API key and other settings
     * @return Configured DinoConfig SDK instance
     * @throws IOException if configuration fails
     * @throws IllegalArgumentException if required configuration is missing
     * 
     * @example
     * ```java
     * DinoConfigSDKConfig config = new DinoConfigSDKConfig();
     * config.setApiKey("dino_your-api-key-here");
     * config.setBaseUrl("https://api.dinoconfig.com");
     * config.setTimeout(10000L);
     * 
     * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(config);
     * 
     * // The SDK is ready to use immediately
     * // Token exchange happens automatically in the background
     * ApiResponse<List<Config>> configs = dinoconfig.getConfigAPI().getAllConfigs(123);
     * 
     * // Get a specific config
     * ApiResponse<Config> config = dinoconfig.getConfigAPI().getConfig(123, 456);
     * ```
     */
    public static DinoConfigSDK create(DinoConfigSDKConfig config) throws IOException {
        if (config == null) {
            throw new IllegalArgumentException("Configuration cannot be null");
        }
        
        DinoConfigSDK sdk = new DinoConfigSDK();
        sdk.configure(config);
        return sdk;
    }
    
    /**
     * Create and configure a new DinoConfig SDK instance with just an API key.
     * Uses default settings for baseUrl and timeout.
     * 
     * @param apiKey The API key for authentication
     * @return Configured DinoConfig SDK instance
     * @throws IOException if configuration fails
     * @throws IllegalArgumentException if API key is null or empty
     * 
     * @example
     * ```java
     * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key-here");
     * 
     * // The SDK is ready to use immediately
     * ApiResponse<List<Config>> configs = dinoconfig.getConfigAPI().getAllConfigs(123);
     * ```
     */
    public static DinoConfigSDK create(String apiKey) throws IOException {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("API key cannot be null or empty");
        }
        
        DinoConfigSDKConfig config = new DinoConfigSDKConfig(apiKey);
        return create(config);
    }
    
    /**
     * Create and configure a new DinoConfig SDK instance with API key and base URL.
     * Uses default timeout setting.
     * 
     * @param apiKey The API key for authentication
     * @param baseUrl The base URL of the DinoConfig API
     * @return Configured DinoConfig SDK instance
     * @throws IOException if configuration fails
     * @throws IllegalArgumentException if API key is null or empty
     * 
     * @example
     * ```java
     * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
     *     "dino_your-api-key-here", 
     *     "https://api.dinoconfig.com"
     * );
     * 
     * // The SDK is ready to use immediately
     * ApiResponse<List<Config>> configs = dinoconfig.getConfigAPI().getAllConfigs(123);
     * ```
     */
    public static DinoConfigSDK create(String apiKey, String baseUrl) throws IOException {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("API key cannot be null or empty");
        }
        
        DinoConfigSDKConfig config = new DinoConfigSDKConfig(apiKey, baseUrl, 10000L);
        return create(config);
    }
    
    /**
     * Create and configure a new DinoConfig SDK instance with all parameters.
     * 
     * @param apiKey The API key for authentication
     * @param baseUrl The base URL of the DinoConfig API
     * @param timeout Request timeout in milliseconds
     * @return Configured DinoConfig SDK instance
     * @throws IOException if configuration fails
     * @throws IllegalArgumentException if API key is null or empty
     * 
     * @example
     * ```java
     * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
     *     "dino_your-api-key-here", 
     *     "https://api.dinoconfig.com",
     *     15000L
     * );
     * 
     * // The SDK is ready to use immediately
     * ApiResponse<List<Config>> configs = dinoconfig.getConfigAPI().getAllConfigs(123);
     * ```
     */
    public static DinoConfigSDK create(String apiKey, String baseUrl, Long timeout) throws IOException {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("API key cannot be null or empty");
        }
        
        DinoConfigSDKConfig config = new DinoConfigSDKConfig(apiKey, baseUrl, timeout);
        return create(config);
    }
}
