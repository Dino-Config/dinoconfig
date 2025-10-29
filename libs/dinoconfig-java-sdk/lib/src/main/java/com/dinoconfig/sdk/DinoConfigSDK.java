package com.dinoconfig.sdk;

import com.dinoconfig.sdk.api.ConfigAPI;
import com.dinoconfig.sdk.http.HttpClient;
import com.dinoconfig.sdk.model.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Main DinoConfig SDK class.
 * Provides a simple interface for interacting with the DinoConfig API.
 */
public class DinoConfigSDK {
    
    private HttpClient httpClient;
    private ConfigAPI configAPI;
    
    /**
     * Configure the SDK with the provided configuration
     * @param config SDK configuration
     * @throws IOException if configuration fails
     */
    public void configure(DinoConfigSDKConfig config) throws IOException {
        String apiKey = config.getApiKey();
        String baseUrl = config.getBaseUrl() != null ? config.getBaseUrl() : "http://localhost:3000";
        Long timeout = config.getTimeout() != null ? config.getTimeout() : 10000L;
        
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("API key is required");
        }
        
        this.httpClient = new HttpClient(baseUrl, timeout);
        
        Map<String, String> headers = new HashMap<>();
        headers.put("X-API-Key", apiKey);
        
        this.httpClient.configureAuthorizationHeader(headers);
        
        // Initialize ConfigAPI
        this.configAPI = new ConfigAPI(this.httpClient);
    }
    
    /**
     * Get the ConfigAPI instance
     * @return ConfigAPI instance
     * @throws IllegalStateException if SDK is not configured
     */
    public ConfigAPI getConfigAPI() {
        if (configAPI == null) {
            throw new IllegalStateException("SDK is not configured. Call configure() first.");
        }
        return configAPI;
    }
}
