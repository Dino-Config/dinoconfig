package com.dinoconfig.sdk.http;

import com.dinoconfig.sdk.model.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * HTTP client for making API requests to the DinoConfig API.
 * Handles authentication, request/response processing, and error handling.
 */
public class HttpClient {
    
    private final String baseUrl;
    private final Long defaultTimeout;
    private final OkHttpClient client;
    private final ObjectMapper objectMapper;
    private Map<String, String> defaultHeaders;
    
    /**
     * Constructor
     * @param baseUrl The base URL of the DinoConfig API
     * @param timeout Request timeout in milliseconds
     */
    public HttpClient(String baseUrl, Long timeout) {
        this.baseUrl = baseUrl.replaceAll("/$", ""); // Remove trailing slash
        this.defaultTimeout = timeout;
        this.objectMapper = new ObjectMapper();
        this.defaultHeaders = new HashMap<>();
        
        // Configure OkHttpClient
        this.client = new OkHttpClient.Builder()
                .connectTimeout(timeout, TimeUnit.MILLISECONDS)
                .readTimeout(timeout, TimeUnit.MILLISECONDS)
                .writeTimeout(timeout, TimeUnit.MILLISECONDS)
                .build();
    }
    
    /**
     * Hash an API key using SHA-256
     * @param apiKey The API key to hash
     * @return The SHA-256 hash as a hexadecimal string
     * @throws IOException if hashing fails
     */
    private String hashApiKey(String apiKey) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(apiKey.getBytes("UTF-8"));
            
            // Convert bytes to hexadecimal string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IOException("SHA-256 algorithm not available: " + e.getMessage(), e);
        } catch (UnsupportedEncodingException e) {
            throw new IOException("UTF-8 encoding not supported: " + e.getMessage(), e);
        }
    }
    
    /**
     * Configure authorization header by exchanging API key for token
     * @param headers Headers containing the API key
     * @throws IOException if authentication fails
     */
    public void configureAuthorizationHeader(Map<String, String> headers) throws IOException {
        String apiKey = headers.get("X-API-Key");
        if (apiKey == null) {
            throw new IllegalArgumentException("X-API-Key header is required");
        }
        
        // Hash the API key before sending
        String hashedApiKey = hashApiKey(apiKey);
        String token = exchangeApiKeyForToken(hashedApiKey);

        this.defaultHeaders = new HashMap<>();
        this.defaultHeaders.put("Content-Type", "application/json");
        this.defaultHeaders.put("Authorization", "Bearer " + token);
        this.defaultHeaders.putAll(headers);
    }
    
    /**
     * Exchange API key for access token
     * Receives a hashed API key and sends it to the server
     * @param hashedApiKey The hashed API key to exchange
     * @return The access token
     * @throws IOException if the exchange fails
     */
    private String exchangeApiKeyForToken(String hashedApiKey) throws IOException {
        try {
            RequestBody body = RequestBody.create("", MediaType.get("application/json"));
            Request request = new Request.Builder()
                    .url(baseUrl + "/api/auth/sdk-token/exchange")
                    .post(body)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("x-api-key", hashedApiKey)
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
     * Make a generic HTTP request
     * @param method HTTP method
     * @param endpoint API endpoint
     * @param data Request data (for POST/PUT/PATCH)
     * @param options Request options
     * @return API response
     * @throws IOException if the request fails
     */
    private <T> ApiResponse<T> request(String method, String endpoint, Object data, RequestOptions options) throws IOException {
        String url = baseUrl + endpoint;
        Long timeout = options != null && options.getTimeout() != null ? options.getTimeout() : defaultTimeout;
        Integer retries = options != null && options.getRetries() != null ? options.getRetries() : 0;
        
        Exception lastError = null;
        
        for (int attempt = 0; attempt <= retries; attempt++) {
            try {
                Request.Builder requestBuilder = new Request.Builder()
                        .url(url);
                
                // Add headers
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
                    T responseData;
                    if (responseBody.isEmpty()) {
                        responseData = null;
                    } else {
                        responseData = objectMapper.readValue(responseBody, new TypeReference<T>() {});
                    }
                    
                    return new ApiResponse<>(responseData, true);
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
            
            // Exponential backoff
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
     * Make a GET request
     * @param endpoint API endpoint
     * @param options Request options
     * @return API response
     * @throws IOException if the request fails
     */
    public <T> ApiResponse<T> get(String endpoint, RequestOptions options) throws IOException {
        return request("GET", endpoint, null, options);
    }
    
    /**
     * Make a POST request
     * @param endpoint API endpoint
     * @param data Request data
     * @param options Request options
     * @return API response
     * @throws IOException if the request fails
     */
    public <T> ApiResponse<T> post(String endpoint, Object data, RequestOptions options) throws IOException {
        return request("POST", endpoint, data, options);
    }
    
    /**
     * Make a PUT request
     * @param endpoint API endpoint
     * @param data Request data
     * @param options Request options
     * @return API response
     * @throws IOException if the request fails
     */
    public <T> ApiResponse<T> put(String endpoint, Object data, RequestOptions options) throws IOException {
        return request("PUT", endpoint, data, options);
    }
    
    /**
     * Make a PATCH request
     * @param endpoint API endpoint
     * @param data Request data
     * @param options Request options
     * @return API response
     * @throws IOException if the request fails
     */
    public <T> ApiResponse<T> patch(String endpoint, Object data, RequestOptions options) throws IOException {
        return request("PATCH", endpoint, data, options);
    }
    
    /**
     * Make a DELETE request
     * @param endpoint API endpoint
     * @param options Request options
     * @return API response
     * @throws IOException if the request fails
     */
    public <T> ApiResponse<T> delete(String endpoint, RequestOptions options) throws IOException {
        return request("DELETE", endpoint, null, options);
    }
    
    /**
     * Set authentication token
     * @param token The authentication token
     */
    public void setToken(String token) {
        defaultHeaders.put("Authorization", "Bearer " + token);
    }
    
    /**
     * Set a custom header
     * @param key Header key
     * @param value Header value
     */
    public void setHeader(String key, String value) {
        defaultHeaders.put(key, value);
    }
    
    /**
     * Remove a custom header
     * @param key Header key to remove
     */
    public void removeHeader(String key) {
        defaultHeaders.remove(key);
    }
}
