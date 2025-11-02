import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}

  /**
   * Generate a secure API key string
   */
  private generateApiKeyString(): string {
    const prefix = 'dino';
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${prefix}_${randomBytes}`;
  }

  /**
   * Hash an API key using bcrypt
   */
  private async hashApiKey(apiKey: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(apiKey, saltRounds);
  }

  /**
   * Hash an API key using SHA-256
   */
  private hashApiKeySha256(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Create a new API key for a user
   */
  async createApiKey(
    auth0Id: string,
    name: string,
    description?: string,
    expiresAt?: Date,
  ): Promise<ApiKey & { key: string }> {
    // Check if a key with the same name exists for this user
    const existingKey = await this.apiKeyRepo.findOne({
      where: { auth0Id, name },
    });

    if (existingKey) {
      throw new ConflictException(`API key with name "${name}" already exists`);
    }

    const key = this.generateApiKeyString();
    const keyHash = await this.hashApiKey(key); // bcrypt hash for secure storage
    const keyHashSha256 = this.hashApiKeySha256(key); // SHA-256 hash for SDK validation

    const apiKey = this.apiKeyRepo.create({
      keyHash,
      keyHashSha256,
      name,
      description,
      auth0Id,
      expiresAt,
      isActive: true,
    });

    const savedApiKey = await this.apiKeyRepo.save(apiKey);

    // Return with plain text key (only time it's exposed)
    return {
      ...savedApiKey,
      key, // Return plain text key for display to user
    };
  }

  /**
   * Find API key by key string and validate
   * Expects a SHA-256 hashed key string from the SDK
   */
  async validateApiKey(keyString: string): Promise<ApiKey | null> {
    // Validate that the keyString is a SHA-256 hash (64 hex characters)
    const isSha256Hash = /^[a-f0-9]{64}$/i.test(keyString);
    
    if (!isSha256Hash) {
      // If not a valid SHA-256 hash, it's an invalid key format
      return null;
    }

    // Lookup by SHA-256 hash
    const apiKey = await this.apiKeyRepo.findOne({
      where: { keyHashSha256: keyString, isActive: true },
      relations: ['user'],
    });

    if (!apiKey) {
      return null;
    }

    // Check if key is expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // Check if user is active
    if (!apiKey.user.isActive) {
      return null;
    }

    // Update last used timestamp
    apiKey.lastUsedAt = new Date();
    await this.apiKeyRepo.save(apiKey);

    return apiKey;
  }

  /**
   * Get all API keys for a user
   */
  async getUserApiKeys(auth0Id: string): Promise<ApiKey[]> {
    return this.apiKeyRepo.find({
      where: { auth0Id },
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'description', 'isActive', 'lastUsedAt', 'expiresAt', 'createdAt', 'updatedAt'],
    });
  }

  /**
   * Get a specific API key by ID
   */
  async getApiKeyById(id: number, auth0Id: string): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepo.findOne({
      where: { id, auth0Id },
      select: ['id', 'name', 'description', 'isActive', 'lastUsedAt', 'expiresAt', 'createdAt', 'updatedAt'],
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return apiKey;
  }

  /**
   * Revoke (deactivate) an API key
   */
  async revokeApiKey(id: number, auth0Id: string): Promise<void> {
    const apiKey = await this.apiKeyRepo.findOne({
      where: { id, auth0Id },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    apiKey.isActive = false;
    await this.apiKeyRepo.save(apiKey);
  }

  /**
   * Delete an API key permanently
   */
  async deleteApiKey(id: number, auth0Id: string): Promise<void> {
    const result = await this.apiKeyRepo.delete({ id, auth0Id });

    if (result.affected === 0) {
      throw new NotFoundException('API key not found');
    }
  }

  /**
   * Update API key metadata
   */
  async updateApiKey(
    id: number,
    auth0Id: string,
    updates: { name?: string; description?: string; expiresAt?: Date },
  ): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepo.findOne({
      where: { id, auth0Id },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    // Check for name conflict if name is being updated
    if (updates.name && updates.name !== apiKey.name) {
      const existingKey = await this.apiKeyRepo.findOne({
        where: { auth0Id, name: updates.name },
      });

      if (existingKey) {
        throw new ConflictException(`API key with name "${updates.name}" already exists`);
      }
    }

    Object.assign(apiKey, updates);
    return this.apiKeyRepo.save(apiKey);
  }

  /**
   * Count active API keys for a user
   */
  async countUserActiveKeys(auth0Id: string): Promise<number> {
    return this.apiKeyRepo.count({
      where: { auth0Id, isActive: true },
    });
  }

  /**
   * Clean up expired API keys (can be used in a scheduled task)
   */
  async cleanupExpiredKeys(): Promise<number> {
    const result = await this.apiKeyRepo
      .createQueryBuilder()
      .update(ApiKey)
      .set({ isActive: false })
      .where('expiresAt < :now', { now: new Date() })
      .andWhere('isActive = :active', { active: true })
      .execute();

    return result.affected || 0;
  }
}