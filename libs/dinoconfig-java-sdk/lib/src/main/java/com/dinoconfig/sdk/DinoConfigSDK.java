/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk;

import com.dinoconfig.sdk.api.ConfigAPI;
import com.dinoconfig.sdk.api.DiscoveryAPI;
import com.dinoconfig.sdk.http.HttpClient;
import com.dinoconfig.sdk.model.DinoConfigSDKConfig;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

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
 *
 * // Get entire config
 * ApiResponse<ConfigData> config = configAPI.get("MyBrand", "AppSettings");
 * System.out.println("Values: " + config.getData().getValues());
 *
 * // Get single value
 * ApiResponse<Object> response = configAPI.getValue("MyBrand", "AppSettings", "theme");
 * System.out.println("Theme: " + response.getData());
 *
 * // Using path-based shorthand
 * ApiResponse<Object> value = configAPI.getValue("MyBrand.AppSettings.theme");
 *
 * // Discovery API
 * DiscoveryAPI discoveryAPI = dinoconfig.getDiscoveryAPI();
 * ApiResponse<List<BrandInfo>> brands = discoveryAPI.listBrands();
 * ApiResponse<IntrospectionResult> introspection = discoveryAPI.introspect();
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
 * @version 1.1.0
 * @since 1.0.0
 * @see DinoConfigSDKFactory
 * @see ConfigAPI
 * @see DiscoveryAPI
 */
public class DinoConfigSDK {

    /** The HTTP client for making API requests */
    private HttpClient httpClient;

    /** The Configuration API instance */
    private ConfigAPI configAPI;

    /** The Discovery API instance */
    private DiscoveryAPI discoveryAPI;

    /** Indicates whether the SDK has been configured */
    private volatile boolean configured = false;

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
     *   <li>API modules (ConfigAPI, DiscoveryAPI) are initialized</li>
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
     * DiscoveryAPI discoveryAPI = sdk.getDiscoveryAPI();
     * }</pre>
     *
     * @param config The SDK configuration containing API key and other settings
     * @throws IOException if the API key exchange fails due to network issues
     *                     or invalid credentials
     * @throws IllegalArgumentException if the API key is null or empty
     * @throws NullPointerException if config is null
     * @see DinoConfigSDKConfig
     */
    public void configure(DinoConfigSDKConfig config) throws IOException {
        Objects.requireNonNull(config, "Configuration cannot be null");

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
        this.discoveryAPI = new DiscoveryAPI(this.httpClient);

        this.configured = true;
    }

    /**
     * Returns the Configuration API instance for retrieving configuration values.
     *
     * <p>The ConfigAPI provides methods for fetching configuration values from
     * the DinoConfig service, including:
     * <ul>
     *   <li>{@code get()} - Get an entire configuration</li>
     *   <li>{@code getValue()} - Get a single configuration value</li>
     *   <li>Path-based shorthand access (e.g., "Brand.Config.Key")</li>
     * </ul>
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");
     * ConfigAPI configAPI = dinoconfig.getConfigAPI();
     *
     * // Get entire config
     * ApiResponse<ConfigData> config = configAPI.get("MyBrand", "AppSettings");
     *
     * // Get single value
     * ApiResponse<Object> response = configAPI.getValue("MyBrand", "AppSettings", "theme");
     *
     * // Using path shorthand
     * ApiResponse<Object> value = configAPI.getValue("MyBrand.AppSettings.theme");
     * }</pre>
     *
     * @return The ConfigAPI instance for configuration value retrieval
     * @throws IllegalStateException if the SDK has not been configured yet
     *                               (i.e., {@link #configure(DinoConfigSDKConfig)} was not called)
     * @see ConfigAPI
     */
    public ConfigAPI getConfigAPI() {
        ensureConfigured();
        return configAPI;
    }

    /**
     * Returns the Discovery API instance for exploring available configurations.
     *
     * <p>The DiscoveryAPI provides methods for discovering what configurations
     * are available to the current API key, including:
     * <ul>
     *   <li>{@code listBrands()} - List all accessible brands</li>
     *   <li>{@code listConfigs()} - List configs for a brand</li>
     *   <li>{@code getSchema()} - Get the schema for a configuration</li>
     *   <li>{@code introspect()} - Full introspection of all brands, configs, and keys</li>
     * </ul>
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * DinoConfigSDK dinoconfig = DinoConfigSDKFactory.create("dino_your-api-key");
     * DiscoveryAPI discoveryAPI = dinoconfig.getDiscoveryAPI();
     *
     * // List all brands
     * ApiResponse<List<BrandInfo>> brands = discoveryAPI.listBrands();
     * for (BrandInfo brand : brands.getData()) {
     *     System.out.printf("Brand: %s (%d configs)%n",
     *         brand.getName(), brand.getConfigCount());
     * }
     *
     * // Full introspection
     * ApiResponse<IntrospectionResult> result = discoveryAPI.introspect();
     * }</pre>
     *
     * @return The DiscoveryAPI instance for configuration discovery
     * @throws IllegalStateException if the SDK has not been configured yet
     * @see DiscoveryAPI
     */
    public DiscoveryAPI getDiscoveryAPI() {
        ensureConfigured();
        return discoveryAPI;
    }

    /**
     * Checks if the SDK has been configured.
     *
     * @return true if configured, false otherwise
     */
    public boolean isConfigured() {
        return configured;
    }

    /**
     * Ensures the SDK is configured before use.
     *
     * @throws IllegalStateException if not configured
     */
    private void ensureConfigured() {
        if (!configured) {
            throw new IllegalStateException(
                    "SDK is not configured. Call configure() first or use DinoConfigSDKFactory.create()."
            );
        }
    }
}
