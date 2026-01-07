/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.api;

import com.dinoconfig.sdk.http.HttpClient;
import com.dinoconfig.sdk.model.ApiResponse;
import com.dinoconfig.sdk.model.RequestOptions;

import java.io.IOException;

/**
 * Configuration API client for retrieving configuration values from DinoConfig.
 * 
 * <p>This class provides methods for fetching configuration values from the
 * DinoConfig API. It handles request formatting, error handling, and response
 * parsing automatically.
 * 
 * <p><b>Usage:</b> Access this class through {@link com.dinoconfig.sdk.DinoConfigSDK#getConfigAPI()}.
 * 
 * <pre>{@code
 * // Get SDK instance
 * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");
 * 
 * // Get ConfigAPI instance
 * ConfigAPI configAPI = dinoconfig.getConfigAPI();
 * 
 * // Retrieve a configuration value
 * ApiResponse<Object> response = configAPI.getConfigValue(
 *     "MyBrand",       // brand name
 *     "AppSettings",   // config name
 *     "theme",         // config value key
 *     new RequestOptions()
 * );
 * 
 * if (response.getSuccess()) {
 *     String theme = (String) response.getData();
 *     System.out.println("Theme: " + theme);
 * }
 * }</pre>
 * 
 * <p><b>Error Handling:</b> Methods throw {@link IOException} for network errors
 * and {@link com.dinoconfig.sdk.model.ApiError} for API errors (4xx, 5xx responses).
 * 
 * <p><b>Thread Safety:</b> This class is thread-safe and can be used from
 * multiple threads concurrently.
 * 
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 * @see com.dinoconfig.sdk.DinoConfigSDK#getConfigAPI()
 * @see ApiResponse
 * @see RequestOptions
 */
public class ConfigAPI {
    
    /** The HTTP client for making API requests */
    private final HttpClient httpClient;
    
    /**
     * Constructs a new ConfigAPI instance.
     * 
     * <p><b>Note:</b> This constructor is intended for internal use.
     * Use {@link com.dinoconfig.sdk.DinoConfigSDK#getConfigAPI()} to obtain
     * a ConfigAPI instance.
     * 
     * @param httpClient The HTTP client instance for making API requests.
     *                   Must not be {@code null}.
     * @throws NullPointerException if {@code httpClient} is {@code null}
     */
    public ConfigAPI(HttpClient httpClient) {
        if (httpClient == null) {
            throw new NullPointerException("HttpClient cannot be null");
        }
        this.httpClient = httpClient;
    }
    
    /**
     * Retrieves a specific configuration value from DinoConfig.
     * 
     * <p>This method fetches a single value from a configuration by specifying
     * the brand name, configuration name, and the key within the configuration.
     * 
     * <p><b>URL Pattern:</b> {@code GET /api/sdk/brands/{brandName}/configs/{configName}/{configValueKey}}
     * 
     * <p><b>Basic Example:</b>
     * <pre>{@code
     * ConfigAPI configAPI = dinoconfig.getConfigAPI();
     * 
     * ApiResponse<Object> response = configAPI.getConfigValue(
     *     "Acme",           // brand name
     *     "AppSettings",    // config name
     *     "theme",          // config value key
     *     new RequestOptions()
     * );
     * 
     * if (response.getSuccess()) {
     *     String theme = (String) response.getData();
     *     System.out.println("Theme: " + theme);  // e.g., "dark"
     * }
     * }</pre>
     * 
     * <p><b>Feature Flag Example:</b>
     * <pre>{@code
     * ApiResponse<Object> response = configAPI.getConfigValue(
     *     "MyApp",
     *     "FeatureFlags",
     *     "enableBetaFeatures",
     *     new RequestOptions()
     * );
     * 
     * if (response.getSuccess() && response.getData() instanceof Boolean) {
     *     boolean isBetaEnabled = (Boolean) response.getData();
     *     if (isBetaEnabled) {
     *         // Show beta features
     *     }
     * }
     * }</pre>
     * 
     * <p><b>With Custom Request Options:</b>
     * <pre>{@code
     * RequestOptions options = new RequestOptions();
     * options.setTimeout(30000L);  // 30 second timeout
     * options.setRetries(5);       // Retry up to 5 times
     * options.setHeaders(Map.of(
     *     "X-Request-ID", UUID.randomUUID().toString()
     * ));
     * 
     * ApiResponse<Object> response = configAPI.getConfigValue(
     *     "MyBrand",
     *     "CriticalConfig",
     *     "databaseUrl",
     *     options
     * );
     * }</pre>
     * 
     * <p><b>Error Handling Example:</b>
     * <pre>{@code
     * try {
     *     ApiResponse<Object> response = configAPI.getConfigValue(
     *         "MyBrand", "MyConfig", "myKey", new RequestOptions()
     *     );
     *     
     *     if (response.getSuccess()) {
     *         System.out.println("Value: " + response.getData());
     *     }
     * } catch (ApiError e) {
     *     if (e.getStatus() == 404) {
     *         System.out.println("Configuration or key not found");
     *     } else if (e.getStatus() == 401) {
     *         System.out.println("Unauthorized - check your API key");
     *     } else {
     *         System.out.println("Error: " + e.getMessage());
     *     }
     * } catch (IOException e) {
     *     System.out.println("Network error: " + e.getMessage());
     * }
     * }</pre>
     * 
     * @param brandName The name of the brand containing the configuration.
     *                  Must not be {@code null} or empty.
     * @param configName The name of the configuration.
     *                   Must not be {@code null} or empty.
     * @param configValueKey The key of the specific value to retrieve.
     *                       Must not be {@code null} or empty.
     * @param options Request options for customizing the request (timeout, retries, headers).
     *                Can be a new empty {@code RequestOptions()} if no customization needed.
     * @return An {@link ApiResponse} containing the configuration value.
     *         The {@code data} field contains the value, which can be any JSON-compatible type
     *         (String, Boolean, Number, Map, List, etc.).
     * @throws IOException if a network error occurs or the request times out
     * @throws com.dinoconfig.sdk.model.ApiError if the API returns an error response
     *         (e.g., 401 Unauthorized, 404 Not Found, 500 Server Error)
     * @see ApiResponse
     * @see RequestOptions
     */
    public ApiResponse<Object> getConfigValue(
            String brandName,
            String configName,
            String configValueKey,
            RequestOptions options) throws IOException {
        
        String endpoint = String.format(
            "/api/sdk/brands/%s/configs/%s/%s",
            brandName,
            configName,
            configValueKey
        );
        
        return httpClient.get(endpoint, options);
    }
}
