package com.dinoconfig.sdk.api;

import com.dinoconfig.sdk.http.HttpClient;
import com.dinoconfig.sdk.model.*;

import java.io.IOException;

/**
 * API client for configuration value retrieval.
 * Provides methods for getting configuration values.
 */
public class ConfigAPI {
    
    private final HttpClient httpClient;
    
    /**
     * Constructor
     * @param httpClient The HTTP client instance
     */
    public ConfigAPI(HttpClient httpClient) {
        this.httpClient = httpClient;
    }
    
    /**
     * Get a specific configuration value by brand name, config name, and config value key
     * @param brandName The brand name
     * @param configName The configuration name
     * @param configValueKey The configuration value key
     * @param options Request options
     * @return API response containing the configuration value
     * @throws IOException if the request fails
     */
    public ApiResponse<Object> getConfigValue(String brandName, String configName, String configValueKey, RequestOptions options) throws IOException {
        try {
            String endpoint = String.format("/api/brands/%s/configs/%s/%s", brandName, configName, configValueKey);
            return httpClient.get(endpoint, options);
        } catch (IOException e) {
            throw e;
        }
    }
}
