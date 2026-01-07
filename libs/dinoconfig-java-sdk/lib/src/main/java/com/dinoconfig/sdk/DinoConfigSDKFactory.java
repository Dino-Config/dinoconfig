/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk;

import com.dinoconfig.sdk.model.DinoConfigSDKConfig;

import java.io.IOException;

/**
 * Factory class for creating and configuring DinoConfig SDK instances.
 * 
 * <p>This class provides convenient static factory methods for SDK instantiation,
 * following the factory pattern for a cleaner, more intuitive initialization experience.
 * 
 * <p><b>Usage Examples:</b>
 * 
 * <pre>{@code
 * // Simple initialization with just API key
 * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");
 * 
 * // With custom base URL
 * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
 *     "dino_your-api-key",
 *     "https://api.dinoconfig.com"
 * );
 * 
 * // With all parameters
 * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
 *     "dino_your-api-key",
 *     "https://api.dinoconfig.com",
 *     15000L  // 15 second timeout
 * );
 * 
 * // Using configuration object
 * DinoConfigSDKConfig config = new DinoConfigSDKConfig();
 * config.setApiKey("dino_your-api-key");
 * config.setBaseUrl("https://api.dinoconfig.com");
 * config.setTimeout(15000L);
 * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(config);
 * }</pre>
 * 
 * <p><b>Thread Safety:</b> Factory methods are thread-safe and can be called
 * from multiple threads concurrently.
 * 
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 * @see DinoConfigSDK
 * @see DinoConfigSDKConfig
 */
public class DinoConfigSDKFactory {
    
    /**
     * Private constructor to prevent instantiation.
     * This is a utility class with only static methods.
     */
    private DinoConfigSDKFactory() {
        throw new UnsupportedOperationException("DinoConfigSDKFactory is a utility class and cannot be instantiated");
    }
    
    /**
     * Creates and configures a new DinoConfig SDK instance with the provided configuration.
     * 
     * <p>The SDK will automatically exchange your API key for an access token
     * during initialization. This happens synchronously, so the returned SDK
     * instance is immediately ready to use.
     * 
     * <p><b>Example:</b>
     * <pre>{@code
     * DinoConfigSDKConfig config = new DinoConfigSDKConfig();
     * config.setApiKey("dino_your-api-key-here");
     * config.setBaseUrl("https://api.dinoconfig.com");
     * config.setTimeout(10000L);
     * 
     * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(config);
     * 
     * // The SDK is ready to use immediately
     * ConfigAPI configAPI = dinoconfig.getConfigAPI();
     * ApiResponse<Object> response = configAPI.getConfigValue(
     *     "mybrand", "myconfig", "mykey", new RequestOptions()
     * );
     * }</pre>
     * 
     * @param config SDK configuration containing API key and other settings.
     *               Must not be {@code null} and must contain a valid API key.
     * @return A fully configured and authenticated DinoConfig SDK instance
     * @throws IOException if the API key exchange fails due to network issues
     *                     or invalid credentials
     * @throws IllegalArgumentException if {@code config} is {@code null} or
     *                                  contains invalid configuration
     * @see DinoConfigSDKConfig
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
     * Creates and configures a new DinoConfig SDK instance with just an API key.
     * 
     * <p>This is the simplest way to initialize the SDK. It uses default values for:
     * <ul>
     *   <li>{@code baseUrl}: {@code "http://localhost:3000"}</li>
     *   <li>{@code timeout}: {@code 10000} milliseconds (10 seconds)</li>
     * </ul>
     * 
     * <p><b>Example:</b>
     * <pre>{@code
     * // Initialize with just API key
     * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key-here");
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
     * @param apiKey The API key for authentication. Must not be {@code null} or empty.
     *               API keys are typically prefixed with {@code "dino_"}.
     * @return A fully configured and authenticated DinoConfig SDK instance
     * @throws IOException if the API key exchange fails
     * @throws IllegalArgumentException if {@code apiKey} is {@code null} or empty
     */
    public static DinoConfigSDK create(String apiKey) throws IOException {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("API key cannot be null or empty");
        }
        
        DinoConfigSDKConfig config = new DinoConfigSDKConfig(apiKey);
        return create(config);
    }
    
    /**
     * Creates and configures a new DinoConfig SDK instance with API key and base URL.
     * 
     * <p>Use this method when you need to specify a custom API endpoint but want
     * to use the default timeout (10 seconds).
     * 
     * <p><b>Example:</b>
     * <pre>{@code
     * // Initialize with API key and custom base URL
     * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
     *     "dino_your-api-key-here",
     *     "https://api.dinoconfig.com"
     * );
     * 
     * // The SDK is ready to use
     * ConfigAPI configAPI = dinoconfig.getConfigAPI();
     * }</pre>
     * 
     * @param apiKey The API key for authentication. Must not be {@code null} or empty.
     * @param baseUrl The base URL of the DinoConfig API (e.g., {@code "https://api.dinoconfig.com"}).
     *                Can be {@code null} to use the default URL.
     * @return A fully configured and authenticated DinoConfig SDK instance
     * @throws IOException if the API key exchange fails
     * @throws IllegalArgumentException if {@code apiKey} is {@code null} or empty
     */
    public static DinoConfigSDK create(String apiKey, String baseUrl) throws IOException {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("API key cannot be null or empty");
        }
        
        DinoConfigSDKConfig config = new DinoConfigSDKConfig(apiKey, baseUrl, 10000L);
        return create(config);
    }
    
    /**
     * Creates and configures a new DinoConfig SDK instance with all parameters.
     * 
     * <p>Use this method when you need full control over the SDK configuration,
     * including custom timeouts for your specific requirements.
     * 
     * <p><b>Example:</b>
     * <pre>{@code
     * // Initialize with all parameters
     * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(
     *     "dino_your-api-key-here",
     *     "https://api.dinoconfig.com",
     *     15000L  // 15 second timeout
     * );
     * 
     * // The SDK is ready to use
     * ConfigAPI configAPI = dinoconfig.getConfigAPI();
     * }</pre>
     * 
     * @param apiKey The API key for authentication. Must not be {@code null} or empty.
     * @param baseUrl The base URL of the DinoConfig API. Can be {@code null} to use default.
     * @param timeout Request timeout in milliseconds. Can be {@code null} to use default (10000ms).
     * @return A fully configured and authenticated DinoConfig SDK instance
     * @throws IOException if the API key exchange fails
     * @throws IllegalArgumentException if {@code apiKey} is {@code null} or empty
     */
    public static DinoConfigSDK create(String apiKey, String baseUrl, Long timeout) throws IOException {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("API key cannot be null or empty");
        }
        
        DinoConfigSDKConfig config = new DinoConfigSDKConfig(apiKey, baseUrl, timeout);
        return create(config);
    }
}
