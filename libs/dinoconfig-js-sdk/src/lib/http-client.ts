/**
 * @fileoverview HTTP client for the DinoConfig SDK.
 * Handles all HTTP communication with the DinoConfig API.
 * @module @dinoconfig/dinoconfig-js-sdk/http-client
 * @version 1.0.0
 * @internal
 */

import { ApiResponse, ApiError, RequestOptions, TokenExchangeResponse } from './types';

/**
 * HTTP client for making requests to the DinoConfig API.
 * 
 * This class handles:
 * - API key to token exchange
 * - Authorization header management
 * - Request/response formatting
 * - Timeout handling
 * - Retry logic with exponential backoff
 * 
 * @class HttpClient
 * @internal This class is used internally by the SDK
 * 
 * @example
 * ```typescript
 * // Internal usage - not typically used directly
 * const client = new HttpClient('https://api.dinoconfig.com', 10000);
 * await client.configureAuthorizationHeader({ 'X-API-Key': 'dino_...' });
 * const response = await client.get('/api/endpoint');
 * ```
 */
export class HttpClient {
  /**
   * Base URL for all API requests.
   * @private
   */
  private baseUrl: string;

  /**
   * Default timeout for requests in milliseconds.
   * @private
   */
  private defaultTimeout: number;

  /**
   * Default headers included in every request.
   * @private
   */
  private defaultHeaders!: Record<string, string>;

  /**
   * Creates a new HttpClient instance.
   * 
   * @param {string} baseUrl - The base URL of the DinoConfig API
   * @param {number} [timeout=10000] - Default request timeout in milliseconds
   * 
   * @example
   * ```typescript
   * const client = new HttpClient('https://api.dinoconfig.com', 15000);
   * ```
   */
  constructor(baseUrl: string, timeout: number = 10000) {
    // Remove trailing slash to prevent double slashes in URLs
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultTimeout = timeout;
  }

  /**
   * Configures authorization by exchanging the API key for an access token.
   * 
   * This method:
   * 1. Extracts the API key from the provided headers
   * 2. Exchanges it for a JWT access token
   * 3. Configures the Authorization header for subsequent requests
   * 
   * @async
   * @method configureAuthorizationHeader
   * @param {Record<string, string>} headers - Headers containing the X-API-Key
   * @returns {Promise<void>}
   * @throws {Error} If token exchange fails
   * 
   * @example
   * ```typescript
   * await client.configureAuthorizationHeader({
   *   'X-API-Key': 'dino_your-api-key-here'
   * });
   * // Client is now authenticated
   * ```
   */
  public async configureAuthorizationHeader(headers: Record<string, string>): Promise<void> {
    const apiKey = headers['X-API-Key'];
    const token = await this.exchangeApiKeyForToken(apiKey);

    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...headers,
    };
  }

  /**
   * Exchanges an API key for a JWT access token.
   * 
   * Makes a POST request to the token exchange endpoint with the API key
   * and returns the access token from the response.
   * 
   * @async
   * @private
   * @method exchangeApiKeyForToken
   * @param {string} apiKey - The API key to exchange
   * @returns {Promise<string>} The JWT access token
   * @throws {Error} If the exchange fails or the API key is invalid
   * 
   * @remarks
   * The API key is sent via HTTPS, which encrypts it in transit.
   * The server validates the key and returns a short-lived access token.
   */
  private async exchangeApiKeyForToken(apiKey: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/sdk-token/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to exchange API key for token: ${response.status} ${errorText}`);
      }

      const data: TokenExchangeResponse = await response.json();
      return data.access_token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to authenticate with API key: ${errorMessage}`);
    }
  }

  /**
   * Makes an HTTP request to the API.
   * 
   * Handles:
   * - Request formatting and headers
   * - Timeout via AbortController
   * - Response parsing
   * - Error handling
   * - Retry logic with exponential backoff
   * 
   * @async
   * @private
   * @method request
   * @typeParam T - The expected response data type
   * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
   * @param {string} endpoint - API endpoint path (e.g., '/api/configs')
   * @param {any} [data] - Request body data (for POST, PUT, PATCH)
   * @param {RequestOptions} [options={}] - Request customization options
   * @returns {Promise<ApiResponse<T>>} The API response
   * @throws {ApiError} If the request fails after all retries
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options.timeout || this.defaultTimeout;
    const retries = options.retries || 0;

    let lastError: Error | null = null;

    // Attempt the request with retries
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Set up abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Build request options
        const requestOptions: RequestInit = {
          method,
          headers: this.defaultHeaders,
          signal: controller.signal,
        };

        // Add body for methods that support it
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
          requestOptions.body = JSON.stringify(data);
        }

        // Make the request
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        // Parse response
        const responseData = await response.json();

        // Handle error responses
        if (!response.ok) {
          const error: ApiError = {
            message: responseData.message || response.statusText,
            status: response.status,
            code: responseData.code,
          };
          throw error;
        }

        // Return successful response
        return {
          data: responseData,
          success: true,
        };
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx) - these are not transient
        if (error instanceof Error && 'status' in error) {
          const apiError = error as ApiError;
          if (apiError.status >= 400 && apiError.status < 500) {
            throw error;
          }
        }

        // Don't retry on last attempt
        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, etc.
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Makes a GET request to the specified endpoint.
   * 
   * @async
   * @method get
   * @typeParam T - The expected response data type
   * @param {string} endpoint - The API endpoint path
   * @param {RequestOptions} [options] - Optional request configuration
   * @returns {Promise<ApiResponse<T>>} The API response
   * 
   * @example
   * ```typescript
   * const response = await client.get<Config>('/api/configs/123');
   * console.log(response.data.name);
   * ```
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * Makes a POST request to the specified endpoint.
   * 
   * @async
   * @method post
   * @typeParam T - The expected response data type
   * @param {string} endpoint - The API endpoint path
   * @param {any} [data] - The request body data
   * @param {RequestOptions} [options] - Optional request configuration
   * @returns {Promise<ApiResponse<T>>} The API response
   * 
   * @example
   * ```typescript
   * const response = await client.post<Config>('/api/configs', {
   *   name: 'NewConfig',
   *   formData: { key: 'value' }
   * });
   * ```
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * Makes a PUT request to the specified endpoint.
   * 
   * @async
   * @method put
   * @typeParam T - The expected response data type
   * @param {string} endpoint - The API endpoint path
   * @param {any} [data] - The request body data
   * @param {RequestOptions} [options] - Optional request configuration
   * @returns {Promise<ApiResponse<T>>} The API response
   * 
   * @example
   * ```typescript
   * const response = await client.put<Config>('/api/configs/123', {
   *   name: 'UpdatedConfig'
   * });
   * ```
   */
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * Makes a PATCH request to the specified endpoint.
   * 
   * @async
   * @method patch
   * @typeParam T - The expected response data type
   * @param {string} endpoint - The API endpoint path
   * @param {any} [data] - The request body data (partial update)
   * @param {RequestOptions} [options] - Optional request configuration
   * @returns {Promise<ApiResponse<T>>} The API response
   * 
   * @example
   * ```typescript
   * const response = await client.patch<Config>('/api/configs/123', {
   *   formData: { updatedKey: 'newValue' }
   * });
   * ```
   */
  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  /**
   * Makes a DELETE request to the specified endpoint.
   * 
   * @async
   * @method delete
   * @typeParam T - The expected response data type
   * @param {string} endpoint - The API endpoint path
   * @param {RequestOptions} [options] - Optional request configuration
   * @returns {Promise<ApiResponse<T>>} The API response
   * 
   * @example
   * ```typescript
   * const response = await client.delete('/api/configs/123');
   * ```
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * Updates the authorization token.
   * 
   * Use this method if you need to manually update the token
   * (e.g., after refreshing it externally).
   * 
   * @method setToken
   * @param {string} token - The new JWT access token
   * 
   * @example
   * ```typescript
   * client.setToken('new-jwt-token');
   * ```
   */
  setToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Sets a custom header for all subsequent requests.
   * 
   * @method setHeader
   * @param {string} key - The header name
   * @param {string} value - The header value
   * 
   * @example
   * ```typescript
   * client.setHeader('X-Custom-Header', 'custom-value');
   * ```
   */
  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  /**
   * Removes a custom header from subsequent requests.
   * 
   * @method removeHeader
   * @param {string} key - The header name to remove
   * 
   * @example
   * ```typescript
   * client.removeHeader('X-Custom-Header');
   * ```
   */
  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }
}
