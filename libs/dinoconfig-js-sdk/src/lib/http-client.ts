import { ApiResponse, ApiError, RequestOptions, TokenExchangeResponse } from './types';

export class HttpClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultHeaders!: Record<string, string>;

  constructor(
    baseUrl: string,
    timeout: number = 10000
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.defaultTimeout = timeout;
  }

  public async configureAuthorizationHeader(headers: Record<string, string>): Promise<void> {
    const token = await this.exchangeApiKeyForToken(headers['X-API-Key']);

    this.defaultHeaders = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...headers,
    };
  }


  /**
   * Exchange API key for access token
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

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const requestOptions: RequestInit = {
          method,
          headers: this.defaultHeaders,
          signal: controller.signal,
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
          requestOptions.body = JSON.stringify(data);
        }

        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        const responseData = await response.json();

        if (!response.ok) {
          const error: ApiError = {
            message: responseData.message || response.statusText,
            status: response.status,
            code: responseData.code,
          };
          throw error;
        }

        return {
          data: responseData,
          success: true,
        };
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication errors or client errors (4xx)
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

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  setToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }
}
