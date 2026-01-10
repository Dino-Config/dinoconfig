/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Configuration class for initializing the DinoConfig SDK.
 * 
 * <p>This class contains all necessary settings for SDK initialization,
 * including authentication credentials and connection parameters.
 * 
 * <p><b>Usage Examples:</b>
 * 
 * <pre>{@code
 * // Using constructor with API key only
 * DinoConfigSDKConfig config = new DinoConfigSDKConfig("dino_your-api-key");
 * 
 * // Using full constructor
 * DinoConfigSDKConfig config = new DinoConfigSDKConfig(
 *     "dino_your-api-key",
 *     "https://api.dinoconfig.com",
 *     15000L
 * );
 * 
 * // Using setters (builder-style)
 * DinoConfigSDKConfig config = new DinoConfigSDKConfig();
 * config.setApiKey("dino_your-api-key");
 * config.setBaseUrl("https://api.dinoconfig.com");
 * config.setTimeout(15000L);
 * 
 * // Create SDK with config
 * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create(config);
 * }</pre>
 * 
 * <p><b>Default Values:</b>
 * <ul>
 *   <li>{@code baseUrl}: {@code "http://localhost:3000"}</li>
 *   <li>{@code timeout}: {@code 10000} milliseconds (10 seconds)</li>
 * </ul>
 * 
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 * @see com.dinoconfig.sdk.DinoConfigSDKFactory
 */
public class DinoConfigSDKConfig {
    
    /**
     * The API key for authentication.
     * 
     * <p>Obtain this from your DinoConfig dashboard under Settings &gt; SDK &amp; API Keys.
     * API keys are typically prefixed with {@code "dino_"}.
     * 
     * <p><b>Security Note:</b> Keep your API key secure and never expose it in
     * client-side code or version control. Use environment variables in production.
     */
    @JsonProperty("apiKey")
    private String apiKey;
    
    /**
     * The base URL of the DinoConfig API.
     * 
     * <p>Default: {@code "http://localhost:3000"}
     * 
     * <p>For production, use: {@code "https://api.dinoconfig.com"}
     */
    @JsonProperty("baseUrl")
    private String baseUrl;
    
    /**
     * Request timeout in milliseconds.
     * 
     * <p>Default: {@code 10000} (10 seconds)
     * 
     * <p>This timeout applies to connection, read, and write operations.
     * Increase this value for slow networks or when expecting large responses.
     */
    @JsonProperty("timeout")
    private Long timeout;
    
    /**
     * Default constructor with default values.
     * 
     * <p>Initializes the configuration with:
     * <ul>
     *   <li>{@code baseUrl}: {@code "http://localhost:3000"}</li>
     *   <li>{@code timeout}: {@code 10000} ms</li>
     *   <li>{@code apiKey}: {@code null} (must be set before use)</li>
     * </ul>
     */
    public DinoConfigSDKConfig() {
        this.baseUrl = "http://localhost:3000";
        this.timeout = 10000L;
    }
    
    /**
     * Constructor with API key only.
     * 
     * <p>Uses default values for {@code baseUrl} and {@code timeout}.
     * 
     * @param apiKey The API key for authentication. Must not be {@code null} or empty.
     * @throws IllegalArgumentException if apiKey is null or empty
     */
    public DinoConfigSDKConfig(String apiKey) {
        this();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("API key cannot be null or empty");
        }
        this.apiKey = apiKey;
    }
    
    /**
     * Full constructor with all parameters.
     * 
     * <p><b>Example:</b>
     * <pre>{@code
     * DinoConfigSDKConfig config = new DinoConfigSDKConfig(
     *     "dino_your-api-key",
     *     "https://api.dinoconfig.com",
     *     15000L  // 15 second timeout
     * );
     * }</pre>
     * 
     * @param apiKey The API key for authentication. Must not be {@code null} or empty.
     * @param baseUrl The base URL of the DinoConfig API. Can be {@code null} to use default.
     * @param timeout Request timeout in milliseconds. Can be {@code null} to use default (10000ms).
     */
    public DinoConfigSDKConfig(String apiKey, String baseUrl, Long timeout) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl != null ? baseUrl : "http://localhost:3000";
        this.timeout = timeout != null ? timeout : 10000L;
    }
    
    /**
     * Returns the API key for authentication.
     * 
     * @return The API key, or {@code null} if not set
     */
    public String getApiKey() {
        return apiKey;
    }
    
    /**
     * Sets the API key for authentication.
     * 
     * @param apiKey The API key. Typically prefixed with {@code "dino_"}.
     * @return This configuration instance for method chaining
     */
    public DinoConfigSDKConfig setApiKey(String apiKey) {
        this.apiKey = apiKey;
        return this;
    }
    
    /**
     * Returns the base URL of the DinoConfig API.
     * 
     * @return The base URL, defaults to {@code "http://localhost:3000"}
     */
    public String getBaseUrl() {
        return baseUrl;
    }
    
    /**
     * Sets the base URL of the DinoConfig API.
     * 
     * @param baseUrl The base URL (e.g., {@code "https://api.dinoconfig.com"})
     * @return This configuration instance for method chaining
     */
    public DinoConfigSDKConfig setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
        return this;
    }
    
    /**
     * Returns the request timeout in milliseconds.
     * 
     * @return The timeout in milliseconds, defaults to {@code 10000}
     */
    public Long getTimeout() {
        return timeout;
    }
    
    /**
     * Sets the request timeout in milliseconds.
     * 
     * @param timeout The timeout in milliseconds. Recommended range: 5000-60000.
     * @return This configuration instance for method chaining
     */
    public DinoConfigSDKConfig setTimeout(Long timeout) {
        this.timeout = timeout;
        return this;
    }
    
    @Override
    public String toString() {
        return "DinoConfigSDKConfig{" +
                "apiKey='" + (apiKey != null ? "****" : "null") + '\'' +
                ", baseUrl='" + baseUrl + '\'' +
                ", timeout=" + timeout +
                '}';
    }
}
