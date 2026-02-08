/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.api;

import com.dinoconfig.sdk.http.HttpClient;
import com.dinoconfig.sdk.model.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Discovery API client for exploring available brands, configurations, and schemas.
 *
 * <p>This class provides methods for discovering what configurations are available
 * to the current API key, including listing brands, configurations, and retrieving
 * schema information.
 *
 * <p><b>Usage:</b> Access this class through {@link com.dinoconfig.sdk.DinoConfigSDK#getDiscoveryAPI()}.
 *
 * <pre>{@code
 * DinoConfigSDK sdk = DinoConfigSDKFactory.create("dino_your-api-key");
 * DiscoveryAPI discoveryAPI = sdk.getDiscoveryAPI();
 *
 * // List all brands
 * List<BrandInfo> brands = discoveryAPI.listBrands();
 * for (BrandInfo brand : brands) {
 *     System.out.printf("Brand: %s (%d configs)%n", brand.getName(), brand.getConfigCount());
 * }
 *
 * // List configs for a brand
 * List<ConfigInfo> configs = discoveryAPI.listConfigs("MyBrand");
 *
 * // Get schema for a config
 * ConfigSchema schema = discoveryAPI.getSchema("MyBrand", "AppSettings");
 *
 * // Full introspection
 * IntrospectionResult result = discoveryAPI.introspect();
 * }</pre>
 *
 * <p><b>Thread Safety:</b> This class is thread-safe and can be used from
 * multiple threads concurrently.
 *
 * @author DinoConfig Team
 * @version 2.0.0
 * @since 1.0.0
 * @see com.dinoconfig.sdk.DinoConfigSDK#getDiscoveryAPI()
 */
public class DiscoveryAPI {

    /** Base path for SDK discovery endpoints */
    private static final String API_BASE_PATH = "/api/sdk";

    /** The HTTP client for making API requests */
    private final HttpClient httpClient;

    /** Shared ObjectMapper for JSON conversion */
    private final ObjectMapper objectMapper;

    /**
     * Constructs a new DiscoveryAPI instance.
     *
     * <p><b>Note:</b> This constructor is intended for internal use.
     * Use {@link com.dinoconfig.sdk.DinoConfigSDK#getDiscoveryAPI()} to obtain
     * a DiscoveryAPI instance.
     *
     * @param httpClient The HTTP client instance for making API requests.
     *                   Must not be {@code null}.
     * @throws NullPointerException if {@code httpClient} is {@code null}
     */
    public DiscoveryAPI(HttpClient httpClient) {
        this.httpClient = Objects.requireNonNull(httpClient, "HttpClient cannot be null");
        this.objectMapper = httpClient.getObjectMapper();
    }

    /**
     * Lists all brands accessible by the current API key.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * List<BrandInfo> brands = discoveryAPI.listBrands();
     * for (BrandInfo brand : brands) {
     *     System.out.printf("Brand: %s (%d configs)%n", brand.getName(), brand.getConfigCount());
     * }
     * }</pre>
     *
     * @return A list of {@link BrandInfo} objects
     * @throws IOException if a network error occurs
     * @throws ApiError if the API returns an error response
     */
    public List<BrandInfo> listBrands() throws IOException {
        return listBrands(null);
    }

    /**
     * Lists all brands with custom request options.
     *
     * @param options Request options for customizing the request
     * @return A list of {@link BrandInfo} objects
     * @throws IOException if a network error occurs
     */
    public List<BrandInfo> listBrands(RequestOptions options) throws IOException {
        Object data = httpClient.get(API_BASE_PATH + "/brands", options);
        BrandListResponse response = objectMapper.convertValue(data, BrandListResponse.class);
        return response.getBrands();
    }

    /**
     * Lists all configurations for a specific brand.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * List<ConfigInfo> configs = discoveryAPI.listConfigs("MyBrand");
     * for (ConfigInfo config : configs) {
     *     System.out.printf("Config: %s (v%d) - %d keys%n",
     *         config.getName(), config.getVersion(), config.getKeys().size());
     * }
     * }</pre>
     *
     * @param brandName The name of the brand. Must not be {@code null} or empty.
     * @return A list of {@link ConfigInfo} objects
     * @throws IOException if a network error occurs
     * @throws IllegalArgumentException if {@code brandName} is null or empty
     */
    public List<ConfigInfo> listConfigs(String brandName) throws IOException {
        return listConfigs(brandName, null);
    }

    /**
     * Lists all configurations for a specific brand with custom options.
     *
     * @param brandName The name of the brand.
     * @param options   Request options
     * @return A list of {@link ConfigInfo} objects
     * @throws IOException if a network error occurs
     */
    public List<ConfigInfo> listConfigs(String brandName, RequestOptions options) throws IOException {
        validateBrandName(brandName);
        Object data = httpClient.get(buildBrandUrl(brandName) + "/configs", options);
        ConfigListResponse response = objectMapper.convertValue(data, ConfigListResponse.class);
        return response.getConfigs();
    }

    /**
     * Gets the schema/structure for a specific configuration.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * ConfigSchema schema = discoveryAPI.getSchema("MyBrand", "FeatureFlags");
     * System.out.printf("Config: %s (v%d)%n", schema.getConfigName(), schema.getVersion());
     *
     * schema.getFields().forEach((name, field) -> {
     *     System.out.printf("  %s: %s%s%n", name, field.getType(), field.isRequired() ? " (required)" : "");
     * });
     * }</pre>
     *
     * @param brandName  The name of the brand.
     * @param configName The name of the configuration.
     * @return The {@link ConfigSchema}
     * @throws IOException if a network error occurs
     */
    public ConfigSchema getSchema(String brandName, String configName) throws IOException {
        return getSchema(brandName, configName, null);
    }

    /**
     * Gets the schema with custom request options.
     *
     * @param brandName  The name of the brand.
     * @param configName The name of the configuration.
     * @param options    Request options
     * @return The {@link ConfigSchema}
     * @throws IOException if a network error occurs
     */
    public ConfigSchema getSchema(String brandName, String configName, RequestOptions options) throws IOException {
        validateBrandName(brandName);
        validateConfigName(configName);
        Object data = httpClient.get(buildConfigUrl(brandName, configName) + "/schema", options);
        return objectMapper.convertValue(data, ConfigSchema.class);
    }

    /**
     * Performs full introspection, returning all brands, configs, and keys.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * IntrospectionResult result = discoveryAPI.introspect();
     * System.out.printf("Company: %s%n", result.getCompany());
     *
     * for (BrandInfoDetail brand : result.getBrands()) {
     *     System.out.printf("Brand: %s%n", brand.getName());
     *     for (ConfigInfoDetail config : brand.getConfigs()) {
     *         System.out.printf("  Config: %s (v%d)%n", config.getName(), config.getVersion());
     *     }
     * }
     * }</pre>
     *
     * @return The {@link IntrospectionResult}
     * @throws IOException if a network error occurs
     */
    public IntrospectionResult introspect() throws IOException {
        return introspect(null);
    }

    /**
     * Performs full introspection with custom request options.
     *
     * @param options Request options
     * @return The {@link IntrospectionResult}
     * @throws IOException if a network error occurs
     */
    public IntrospectionResult introspect(RequestOptions options) throws IOException {
        Object data = httpClient.get(API_BASE_PATH + "/introspect", options);
        return objectMapper.convertValue(data, IntrospectionResult.class);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────────

    private String buildBrandUrl(String brandName) {
        return API_BASE_PATH + "/brands/" + encode(brandName);
    }

    private String buildConfigUrl(String brandName, String configName) {
        return API_BASE_PATH + "/brands/" + encode(brandName) + "/configs/" + encode(configName);
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private void validateBrandName(String brandName) {
        if (brandName == null || brandName.trim().isEmpty()) {
            throw new IllegalArgumentException("Brand name cannot be null or empty");
        }
    }

    private void validateConfigName(String configName) {
        if (configName == null || configName.trim().isEmpty()) {
            throw new IllegalArgumentException("Config name cannot be null or empty");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Internal response types
    // ─────────────────────────────────────────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class BrandListResponse {
        @JsonProperty("brands")
        private List<BrandInfo> brands;

        public List<BrandInfo> getBrands() {
            return brands;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ConfigListResponse {
        @JsonProperty("configs")
        private List<ConfigInfo> configs;

        public List<ConfigInfo> getConfigs() {
            return configs;
        }
    }
}
