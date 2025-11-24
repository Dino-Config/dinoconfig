export interface ApiKey {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyList {
  keys: ApiKey[];
  total: number;
  active: number;
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
}

export interface CreateApiKeyResponse {
  key: string;
  name: string;
}

