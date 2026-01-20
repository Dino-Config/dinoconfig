/*
 * DinoConfig Java SDK
 * Copyright (c) 2024 DinoConfig Team
 * Licensed under the MIT License
 */
package com.dinoconfig.sdk.http;

import com.dinoconfig.sdk.model.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import okhttp3.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * HTTP client for making requests to the DinoConfig API.
 * 
 * <p>This class handles all HTTP communication with the DinoConfig API, including:
 * <ul>
 *   <li>API key to token exchange</li>
 *   <li>Authorization header management</li>
 *   <li>Request/response JSON serialization</li>
 *   <li>Timeout handling</li>
 *   <li>Retry logic with exponential backoff</li>
 * </ul>
 * 
 * <p><b>Note:</b> This class is intended for internal use by the SDK.
 * Use {@link com.dinoconfig.sdk.DinoConfigSDKFactory} and
 * {@link com.dinoconfig.sdk.api.ConfigAPI} for public API access.
 * 
 * <p><b>Thread Safety:</b> This class is thread-safe after initialization.
 * The OkHttpClient is shared across all requests and handles connection pooling.
 * 
 * @author DinoConfig Team
 * @version 1.0.0
 * @since 1.0.0
 */
public class HttpClient {
    
    /** Base URL for all API requests */
    private final String baseUrl;
    
    /** Default timeout for requests in milliseconds */
    private final Long defaultTimeout;
    
    /** OkHttp client for making HTTP requests */
    private final OkHttpClient client;
    
    /** Jackson ObjectMapper for JSON serialization/deserialization */
    private final ObjectMapper objectMapper;
    
    /** Default headers included in every request */
    private Map<String, String> defaultHeaders;
    
    /**
     * Creates a new HttpClient instance.
     * 
     * @param baseUrl The base URL of the DinoConfig API (e.g., "https://api.dinoconfig.com")
     * @param timeout Default request timeout in milliseconds
     */
    public HttpClient(String baseUrl, Long timeout) {
        // Remove trailing slash to prevent double slashes in URLs
        this.baseUrl = baseUrl.replaceAll("/$", "");
        this.defaultTimeout = timeout;
        this.objectMapper = new ObjectMapper();
        // Register JavaTimeModule for Java 8 date/time types support
        this.objectMapper.registerModule(new JavaTimeModule());
        this.defaultHeaders = new HashMap<>();
        
        // Configure OkHttpClient with timeouts
        this.client = new OkHttpClient.Builder()
                .connectTimeout(timeout, TimeUnit.MILLISECONDS)
                .readTimeout(timeout, TimeUnit.MILLISECONDS)
                .writeTimeout(timeout, TimeUnit.MILLISECONDS)
                .build();
    }
    
    /**
     * Configures authorization by exchanging the API key for an access token.
     * 
     * <p>This method:
     * <ol>
     *   <li>Extracts the API key from the provided headers</li>
     *   <li>Exchanges it for a JWT access token</li>
     *   <li>Configures the Authorization header for subsequent requests</li>
     * </ol>
     * 
     * @param headers Headers containing the X-API-Key
     * @throws IOException if the token exchange fails
     * @throws IllegalArgumentException if X-API-Key header is missing
     */
    public void configureAuthorizationHeader(Map<String, String> headers) throws IOException {
        String apiKey = headers.get("X-API-Key");
        if (apiKey == null) {
            throw new IllegalArgumentException("X-API-Key header is required");
        }
        
        String token = exchangeApiKeyForToken(apiKey);

        this.defaultHeaders = new HashMap<>();
        this.defaultHeaders.put("Content-Type", "application/json");
        this.defaultHeaders.put("Authorization", "Bearer " + token);
        this.defaultHeaders.putAll(headers);
    }
    
    /**
     * Exchanges an API key for a JWT access token.
     * 
     * <p>Makes a POST request to the token exchange endpoint with the API key
     * and returns the access token from the response.
     * 
     * @param apiKey The API key to exchange
     * @return The JWT access token
     * @throws IOException if the exchange fails or the API key is invalid
     */
    private String exchangeApiKeyForToken(String apiKey) throws IOException {
        try {
            RequestBody body = RequestBody.create("", MediaType.get("application/json"));
            Request request = new Request.Builder()
                    .url(baseUrl + "/api/auth/sdk-token/exchange")
                    .post(body)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("x-api-key", apiKey)
                    .build();
            
            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "";
                    throw new IOException("Failed to exchange API key for token: " + response.code() + " " + errorBody);
                }
                
                if (response.body() == null) {
                    throw new IOException("Empty response body");
                }
                
                String responseBody = response.body().string();
                TokenExchangeResponse tokenResponse = objectMapper.readValue(responseBody, TokenExchangeResponse.class);
                
                return tokenResponse.getAccessToken();
            }
        } catch (Exception e) {
            throw new IOException("Failed to authenticate with API key: " + e.getMessage(), e);
        }
    }
    
    /**
     * Makes a generic HTTP request to the API.
     * 
     * <p>Handles:
     * <ul>
     *   <li>Request formatting and headers</li>
     *   <li>Custom timeouts per request</li>
     *   <li>Response parsing</li>
     *   <li>Error handling</li>
     *   <li>Retry logic with exponential backoff</li>
     * </ul>
     * 
     * @param <T> The expected response data type
     * @param method HTTP method (GET, POST, PUT, PATCH, DELETE)
     * @param endpoint API endpoint path (e.g., "/api/configs/123")
     * @param data Request body data (for POST, PUT, PATCH)
     * @param options Request customization options
     * @return The API response
     * @throws IOException if a network error occurs
     * @throws ApiError if the API returns an error response
     */
    private <T> ApiResponse<T> request(String method, String endpoint, Object data, RequestOptions options) throws IOException {
        String url = baseUrl + endpoint;
        Long timeout = options != null && options.getTimeout() != null ? options.getTimeout() : defaultTimeout;
        Integer retries = options != null && options.getRetries() != null ? options.getRetries() : 0;
        
        Exception lastError = null;
        
        // Attempt the request with retries
        for (int attempt = 0; attempt <= retries; attempt++) {
            try {
                Request.Builder requestBuilder = new Request.Builder()
                        .url(url);
                
                // Merge headers
                Map<String, String> headers = new HashMap<>(defaultHeaders);
                if (options != null && options.getHeaders() != null) {
                    headers.putAll(options.getHeaders());
                }
                
                for (Map.Entry<String, String> entry : headers.entrySet()) {
                    requestBuilder.addHeader(entry.getKey(), entry.getValue());
                }
                
                // Set method and body
                RequestBody body = null;
                if (data != null && (method.equals("POST") || method.equals("PUT") || method.equals("PATCH"))) {
                    String jsonData = objectMapper.writeValueAsString(data);
                    body = RequestBody.create(jsonData, MediaType.get("application/json"));
                }
                
                switch (method.toUpperCase()) {
                    case "GET":
                        requestBuilder.get();
                        break;
                    case "POST":
                        requestBuilder.post(body != null ? body : RequestBody.create("", MediaType.get("application/json")));
                        break;
                    case "PUT":
                        requestBuilder.put(body != null ? body : RequestBody.create("", MediaType.get("application/json")));
                        break;
                    case "PATCH":
                        requestBuilder.patch(body != null ? body : RequestBody.create("", MediaType.get("application/json")));
                        break;
                    case "DELETE":
                        requestBuilder.delete();
                        break;
                    default:
                        throw new IllegalArgumentException("Unsupported HTTP method: " + method);
                }
                
                Request request = requestBuilder.build();
                
                // Create client with custom timeout if specified
                OkHttpClient requestClient = client;
                if (timeout != null && !timeout.equals(defaultTimeout)) {
                    requestClient = client.newBuilder()
                            .connectTimeout(timeout, TimeUnit.MILLISECONDS)
                            .readTimeout(timeout, TimeUnit.MILLISECONDS)
                            .writeTimeout(timeout, TimeUnit.MILLISECONDS)
                            .build();
                }
                
                try (Response response = requestClient.newCall(request).execute()) {
                    String responseBody = response.body() != null ? response.body().string() : "";
                    
                    if (!response.isSuccessful()) {
                        ApiError apiError;
                        try {
                            apiError = objectMapper.readValue(responseBody, ApiError.class);
                        } catch (Exception e) {
                            apiError = new ApiError(responseBody.isEmpty() ? response.message() : responseBody, response.code());
                        }
                        throw apiError;
                    }
                    
                    // Parse response
                    ApiResponse<T> apiResponse;
                    if (responseBody.isEmpty()) {
                        apiResponse = new ApiResponse<>(null, true);
                    } else {
                        try {
                            // Try to deserialize as ApiResponse structure first
                            TypeFactory typeFactory = objectMapper.getTypeFactory();
                            com.fasterxml.jackson.databind.JavaType responseType = typeFactory.constructParametricType(
                                ApiResponse.class, 
                                Object.class
                            );
                            @SuppressWarnings("unchecked")
                            ApiResponse<Object> rawResponse = objectMapper.readValue(responseBody, responseType);
                            
                            // If it has success field, it's already wrapped in ApiResponse
                            if (rawResponse.getSuccess() != null) {
                                @SuppressWarnings("unchecked")
                                T responseData = (T) rawResponse.getData();
                                apiResponse = new ApiResponse<>(responseData, rawResponse.getSuccess(), rawResponse.getMessage());
                            } else {
                                // Not wrapped, treat entire response as data
                                @SuppressWarnings("unchecked")
                                T responseData = (T) objectMapper.readValue(responseBody, Object.class);
                                apiResponse = new ApiResponse<>(responseData, true);
                            }
                        } catch (Exception e) {
                            // If deserialization as ApiResponse fails, treat entire response as data
                            @SuppressWarnings("unchecked")
                            T responseData = (T) objectMapper.readValue(responseBody, Object.class);
                            apiResponse = new ApiResponse<>(responseData, true);
                        }
                    }
                    
                    return apiResponse;
                }
                
            } catch (ApiError e) {
                // Don't retry on authentication errors or client errors (4xx)
                if (e.getStatus() >= 400 && e.getStatus() < 500) {
                    throw e;
                }
                lastError = e;
            } catch (IOException e) {
                lastError = e;
            } catch (Exception e) {
                lastError = e;
            }
            
            // Don't retry on last attempt
            if (attempt == retries) {
                break;
            }
            
            // Exponential backoff: 1s, 2s, 4s, 8s, etc.
            try {
                Thread.sleep((long) Math.pow(2, attempt) * 1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IOException("Request interrupted", e);
            }
        }
        
        if (lastError instanceof IOException) {
            throw (IOException) lastError;
        } else if (lastError instanceof ApiError) {
            throw (ApiError) lastError;
        } else if (lastError != null) {
            throw new IOException("Request failed after all retries: " + lastError.getMessage(), lastError);
        } else {
            throw new IOException("Request failed after all retries");
        }
    }
    
    /**
     * Makes a GET request to the specified endpoint.
     * 
     * @param <T> The expected response data type
     * @param endpoint API endpoint path
     * @param options Request customization options
     * @return The API response
     * @throws IOException if the request fails
     */
    public <T> ApiResponse<T> get(String endpoint, RequestOptions options) throws IOException {
        return request("GET", endpoint, null, options);
    }
    
    /**
     * Makes a POST request to the specified endpoint.
     * 
     * @param <T> The expected response data type
     * @param endpoint API endpoint path
     * @param data Request body data
     * @param options Request customization options
     * @return The API response
     * @throws IOException if the request fails
     */
    public <T> ApiResponse<T> post(String endpoint, Object data, RequestOptions options) throws IOException {
        return request("POST", endpoint, data, options);
    }
    
    /**
     * Makes a PUT request to the specified endpoint.
     * 
     * @param <T> The expected response data type
     * @param endpoint API endpoint path
     * @param data Request body data
     * @param options Request customization options
     * @return The API response
     * @throws IOException if the request fails
     */
    public <T> ApiResponse<T> put(String endpoint, Object data, RequestOptions options) throws IOException {
        return request("PUT", endpoint, data, options);
    }
    
    /**
     * Makes a PATCH request to the specified endpoint.
     * 
     * @param <T> The expected response data type
     * @param endpoint API endpoint path
     * @param data Request body data (partial update)
     * @param options Request customization options
     * @return The API response
     * @throws IOException if the request fails
     */
    public <T> ApiResponse<T> patch(String endpoint, Object data, RequestOptions options) throws IOException {
        return request("PATCH", endpoint, data, options);
    }
    
    /**
     * Makes a DELETE request to the specified endpoint.
     * 
     * @param <T> The expected response data type
     * @param endpoint API endpoint path
     * @param options Request customization options
     * @return The API response
     * @throws IOException if the request fails
     */
    public <T> ApiResponse<T> delete(String endpoint, RequestOptions options) throws IOException {
        return request("DELETE", endpoint, null, options);
    }
    
    /**
     * Updates the authentication token.
     * 
     * @param token The new JWT access token
     */
    public void setToken(String token) {
        defaultHeaders.put("Authorization", "Bearer " + token);
    }
    
    /**
     * Sets a custom header for all subsequent requests.
     * 
     * @param key Header name
     * @param value Header value
     */
    public void setHeader(String key, String value) {
        defaultHeaders.put(key, value);
    }
    
    /**
     * Removes a custom header from subsequent requests.
     * 
     * @param key Header name to remove
     */
    public void removeHeader(String key) {
        defaultHeaders.remove(key);
    }
}
