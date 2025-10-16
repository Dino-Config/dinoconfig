export class ApiKeyResponseDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ApiKeyWithSecretResponseDto extends ApiKeyResponseDto {
  key: string;
}

export class ApiKeyListResponseDto {
  keys: ApiKeyResponseDto[];
  total: number;
  active: number;
}


