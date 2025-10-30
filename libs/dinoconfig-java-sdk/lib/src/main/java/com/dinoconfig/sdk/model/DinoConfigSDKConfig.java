package com.dinoconfig.sdk.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Configuration class for the DinoConfig SDK.
 * Contains all necessary settings for SDK initialization.
 */
public class DinoConfigSDKConfig {
    
    /**
     * The API key for authentication
     */
    @JsonProperty("apiKey")
    private String apiKey;
    
    /**
     * The base URL of the DinoConfig API
     */
    @JsonProperty("baseUrl")
    private String baseUrl;
    
    /**
     * Request timeout in milliseconds
     */
    @JsonProperty("timeout")
    private Long timeout;
    
    /**
     * Default constructor
     */
    public DinoConfigSDKConfig() {
        this.baseUrl = "http://localhost:3000";
        this.timeout = 10000L;
    }
    
    /**
     * Constructor with API key
     * @param apiKey The API key for authentication
     */
    public DinoConfigSDKConfig(String apiKey) {
        this();
        this.apiKey = apiKey;
    }
    
    /**
     * Full constructor
     * @param apiKey The API key for authentication
     * @param baseUrl The base URL of the DinoConfig API
     * @param timeout Request timeout in milliseconds
     */
    public DinoConfigSDKConfig(String apiKey, String baseUrl, Long timeout) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.timeout = timeout;
    }
    
    // Getters and Setters
    public String getApiKey() {
        return apiKey;
    }
    
    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }
    
    public String getBaseUrl() {
        return baseUrl;
    }
    
    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    public Long getTimeout() {
        return timeout;
    }
    
    public void setTimeout(Long timeout) {
        this.timeout = timeout;
    }
}
