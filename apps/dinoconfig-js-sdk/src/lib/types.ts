export interface DinoConfigSDKConfig {
  /** The API key for authentication */
  apiKey: string;
  /** The base URL of the DinoConfig API */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

export interface TokenExchangeResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  company?: string;
}

export interface Config {
  id: number;
  name: string;
  description?: string;
  company?: string;
  formData: Record<string, any>;
  schema?: Record<string, any>;
  uiSchema?: Record<string, any>;
  version: number;
  createdAt: Date;
  brand: {
    id: number;
    name: string;
  };
}

export interface CreateConfigDto {
  name: string;
  description?: string;
  formData: Record<string, any>;
  schema?: Record<string, any>;
  uiSchema?: Record<string, any>;
}

export interface UpdateConfigDto {
  name?: string;
  description?: string;
  formData?: Record<string, any>;
  schema?: Record<string, any>;
  uiSchema?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}
