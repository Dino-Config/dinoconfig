/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.api;

import com.dinoconfig.sdk.http.HttpClient;
import com.dinoconfig.sdk.model.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
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
 * // List configs for a brand
 * ApiResponse<List<ConfigInfo>> configs = discoveryAPI.listConfigs("MyBrand");
 *
 * // Get schema for a config
 * ApiResponse<ConfigSchema> schema = discoveryAPI.getSchema("MyBrand", "AppSettings");
 *
 * // Full introspection
 * ApiResponse<IntrospectionResult> result = discoveryAPI.introspect();
 * }</pre>
 *
 * <p><b>Thread Safety:</b> This class is thread-safe and can be used from
 * multiple threads concurrently.
 *
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 * @see com.dinoconfig.sdk.DinoConfigSDK#getDiscoveryAPI()
 */
public class DiscoveryAPI {

    /** Base path for SDK discovery endpoints */
    private static final String API_BASE_PATH = "/api/sdk";

    /** The HTTP client for making API requests */
    private final HttpClient httpClient;

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
    }

    /**
     * Lists all brands accessible by the current API key.
     *
     * <p>This method returns a list of all brands that the current API key
     * has permission to access, along with metadata about each brand.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * DiscoveryAPI discoveryAPI = dinoconfig.getDiscoveryAPI();
     *
     * ApiResponse<List<BrandInfo>> response = discoveryAPI.listBrands();
     * if (response.getSuccess()) {
     *     for (BrandInfo brand : response.getData()) {
     *         System.out.printf("Brand: %s (%d configs)%n",
     *             brand.getName(), brand.getConfigCount());
     *     }
     * }
     * }</pre>
     *
     * @return An {@link ApiResponse} containing a list of {@link BrandInfo} objects
     * @throws IOException if a network error occurs
     * @throws ApiError if the API returns an error response
     * @see BrandInfo
     */
    public ApiResponse<List<BrandInfo>> listBrands() throws IOException {
        return listBrands(new RequestOptions());
    }

    /**
     * Lists all brands accessible by the current API key with custom request options.
     *
     * @param options Request options for customizing the request (timeout, retries, headers)
     * @return An {@link ApiResponse} containing a list of {@link BrandInfo} objects
     * @throws IOException if a network error occurs
     * @throws ApiError if the API returns an error response
     * @see BrandInfo
     */
    public ApiResponse<List<BrandInfo>> listBrands(RequestOptions options) throws IOException {
        ApiResponse<BrandListResponse> response = httpClient.get(
                API_BASE_PATH + "/brands",
                options
        );
        return extractBrands(response);
    }

    /**
     * Lists all configurations for a specific brand.
     *
     * <p>This method returns metadata about all configurations within the
     * specified brand, including key names and versions.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * DiscoveryAPI discoveryAPI = dinoconfig.getDiscoveryAPI();
     *
     * ApiResponse<List<ConfigInfo>> response = discoveryAPI.listConfigs("MyBrand");
     * if (response.getSuccess()) {
     *     for (ConfigInfo config : response.getData()) {
     *         System.out.printf("Config: %s (v%d) - %d keys%n",
     *             config.getName(), config.getVersion(), config.getKeys().size());
     *     }
     * }
     * }</pre>
     *
     * @param brandName The name of the brand. Must not be {@code null} or empty.
     * @return An {@link ApiResponse} containing a list of {@link ConfigInfo} objects
     * @throws IOException if a network error occurs
     * @throws ApiError if the API returns an error response
     * @throws IllegalArgumentException if {@code brandName} is null or empty
     * @see ConfigInfo
     */
    public ApiResponse<List<ConfigInfo>> listConfigs(String brandName) throws IOException {
        return listConfigs(brandName, new RequestOptions());
    }

    /**
     * Lists all configurations for a specific brand with custom request options.
     *
     * @param brandName The name of the brand. Must not be {@code null} or empty.
     * @param options   Request options for customizing the request
     * @return An {@link ApiResponse} containing a list of {@link ConfigInfo} objects
     * @throws IOException if a network error occurs
     * @throws ApiError if the API returns an error response
     * @throws IllegalArgumentException if {@code brandName} is null or empty
     * @see ConfigInfo
     */
    public ApiResponse<List<ConfigInfo>> listConfigs(String brandName, RequestOptions options) throws IOException {
        validateBrandName(brandName);
        ApiResponse<ConfigListResponse> response = httpClient.get(
                buildBrandUrl(brandName) + "/configs",
                options
        );
        return extractConfigs(response);
    }

    /**
     * Gets the schema/structure for a specific configuration.
     *
     * <p>The schema describes the expected structure of a configuration,
     * including field types, validation rules, and default values.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * DiscoveryAPI discoveryAPI = dinoconfig.getDiscoveryAPI();
     *
     * ApiResponse<ConfigSchema> response = discoveryAPI.getSchema("MyBrand", "AppSettings");
     * if (response.getSuccess()) {
     *     ConfigSchema schema = response.getData();
     *     System.out.printf("Config: %s (v%d)%n",
     *         schema.getConfigName(), schema.getVersion());
     *
     *     schema.getFields().forEach((name, field) -> {
     *         System.out.printf("  %s: %s%s%n",
     *             name, field.getType(), field.isRequired() ? " (required)" : "");
     *     });
     * }
     * }</pre>
     *
     * @param brandName  The name of the brand. Must not be {@code null} or empty.
     * @param configName The name of the configuration. Must not be {@code null} or empty.
     * @return An {@link ApiResponse} containing the {@link ConfigSchema}
     * @throws IOException if a network error occurs
     * @throws ApiError if the API returns an error response
     * @throws IllegalArgumentException if any parameter is null or empty
     * @see ConfigSchema
     */
    public ApiResponse<ConfigSchema> getSchema(String brandName, String configName) throws IOException {
        return getSchema(brandName, configName, new RequestOptions());
    }

    /**
     * Gets the schema/structure for a specific configuration with custom request options.
     *
     * @param brandName  The name of the brand. Must not be {@code null} or empty.
     * @param configName The name of the configuration. Must not be {@code null} or empty.
     * @param options    Request options for customizing the request
     * @return An {@link ApiResponse} containing the {@link ConfigSchema}
     * @throws IOException if a network error occurs
     * @throws ApiError if the API returns an error response
     * @throws IllegalArgumentException if any parameter is null or empty
     * @see ConfigSchema
     */
    public ApiResponse<ConfigSchema> getSchema(String brandName, String configName, RequestOptions options) throws IOException {
        validateBrandName(brandName);
        validateConfigName(configName);
        return httpClient.get(
                buildConfigUrl(brandName, configName) + "/schema",
                options
        );
    }

    /**
     * Performs full introspection, returning all brands, configs, and keys.
     *
     * <p>This method returns the complete structure of all configurations
     * accessible via the current API key. It's useful for code generation,
     * documentation, and understanding the full configuration hierarchy.
     *
     * <p><b>Example:</b>
     * <pre>{@code
     * DiscoveryAPI discoveryAPI = dinoconfig.getDiscoveryAPI();
     *
     * ApiResponse<IntrospectionResult> response = discoveryAPI.introspect();
     * if (response.getSuccess()) {
     *     IntrospectionResult result = response.getData();
     *     System.out.printf("Company: %s%n", result.getCompany());
     *
     *     for (BrandInfoDetail brand : result.getBrands()) {
     *         System.out.printf("Brand: %s%n", brand.getName());
     *         for (ConfigInfoDetail config : brand.getConfigs()) {
     *             System.out.printf("  Config: %s (v%d)%n",
     *                 config.getName(), config.getVersion());
     *             for (KeyInfo key : config.getKeys()) {
     *                 System.out.printf("    %s: %s = %s%n",
     *                     key.getName(), key.getType(), key.getValue());
     *             }
     *         }
     *     }
     * }
     * }</pre>
     *
     * @return An {@link ApiResponse} containing the {@link IntrospectionResult}
     * @throws IOException if a network error occurs
     * @throws ApiError if the API returns an error response
     * @see IntrospectionResult
     */
    public ApiResponse<IntrospectionResult> introspect() throws IOException {
        return introspect(new RequestOptions());
    }

    /**
     * Performs full introspection with custom request options.
     *
     * @param options Request options for customizing the request
     * @return An {@link ApiResponse} containing the {@link IntrospectionResult}
     * @throws IOException if a network error occurs
     * @throws ApiError if the API returns an error response
     * @see IntrospectionResult
     */
    public ApiResponse<IntrospectionResult> introspect(RequestOptions options) throws IOException {
        return httpClient.get(API_BASE_PATH + "/introspect", options);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Builds URL path for brand-level endpoints.
     */
    private String buildBrandUrl(String brandName) {
        return API_BASE_PATH + "/brands/" + encode(brandName);
    }

    /**
     * Builds URL path for config-level endpoints.
     */
    private String buildConfigUrl(String brandName, String configName) {
        return API_BASE_PATH + "/brands/" + encode(brandName) + "/configs/" + encode(configName);
    }

    /**
     * URL-encodes a path segment.
     */
    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    /**
     * Validates the brand name parameter.
     */
    private void validateBrandName(String brandName) {
        if (brandName == null || brandName.trim().isEmpty()) {
            throw new IllegalArgumentException("Brand name cannot be null or empty");
        }
    }

    /**
     * Validates the config name parameter.
     */
    private void validateConfigName(String configName) {
        if (configName == null || configName.trim().isEmpty()) {
            throw new IllegalArgumentException("Config name cannot be null or empty");
        }
    }

    /**
     * Extracts brands from the API response wrapper.
     */
    private ApiResponse<List<BrandInfo>> extractBrands(ApiResponse<BrandListResponse> response) {
        return new ApiResponse<>(
                response.getData() != null ? response.getData().getBrands() : null,
                response.getSuccess(),
                response.getMessage()
        );
    }

    /**
     * Extracts configs from the API response wrapper.
     */
    private ApiResponse<List<ConfigInfo>> extractConfigs(ApiResponse<ConfigListResponse> response) {
        return new ApiResponse<>(
                response.getData() != null ? response.getData().getConfigs() : null,
                response.getSuccess(),
                response.getMessage()
        );
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Internal response types
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Internal wrapper for brand list API responses.
     */
    private static class BrandListResponse {
        @JsonProperty("brands")
        private List<BrandInfo> brands;

        @JsonProperty("total")
        private int total;

        public List<BrandInfo> getBrands() {
            return brands;
        }

        public int getTotal() {
            return total;
        }
    }

    /**
     * Internal wrapper for config list API responses.
     */
    private static class ConfigListResponse {
        @JsonProperty("configs")
        private List<ConfigInfo> configs;

        @JsonProperty("total")
        private int total;

        public List<ConfigInfo> getConfigs() {
            return configs;
        }

        public int getTotal() {
            return total;
        }
    }
}
