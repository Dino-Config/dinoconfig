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
   * Hash an API key using SHA-256 first, then bcrypt
   */
  private async hashApiKey(apiKey: string): Promise<string> {
    // First hash with SHA-256 to normalize the key
    const sha = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Then hash the SHA-256 result with bcrypt for secure storage
    const saltRounds = 12;
    return bcrypt.hash(sha, saltRounds);
  }

  /**
   * Compare an API key with a bcrypt hash
   * First hashes the key with SHA-256, then compares with stored bcrypt hash
   */
  private async compareApiKey(apiKey: string, hash: string): Promise<boolean> {
    // First hash with SHA-256 to match the storage format
    const sha = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Then compare the SHA-256 hash with the stored bcrypt hash
    return bcrypt.compare(sha, hash);
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

    const apiKey = this.apiKeyRepo.create({
      keyHash,
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
   * Receives plain text API key from SDK, hashes it and compares with stored bcrypt hash
   */
  async validateApiKey(keyString: string): Promise<ApiKey | null> {
    // Load all active API keys to compare against
    // Note: bcrypt uses salt, so we can't do direct DB lookup - we must compare each hash
    const allActiveKeys = await this.apiKeyRepo.find({
      where: { isActive: true },
      relations: ['user'],
    });

    // Compare plain text key against each stored bcrypt hash
    for (const apiKey of allActiveKeys) {
      const isValid = await this.compareApiKey(keyString, apiKey.keyHash);
      if (isValid) {
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
    }

    // No matching key found
    return null;
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