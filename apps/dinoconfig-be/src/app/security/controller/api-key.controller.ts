import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guard/jwt.guard';
import { ApiKeyService } from '../service/api-key.service';
import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import { UpdateApiKeyDto } from '../dto/update-api-key.dto';
import { ApiKeyResponseDto, ApiKeyWithSecretResponseDto, ApiKeyListResponseDto } from '../dto/api-key-response.dto';

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  /**
   * Create a new API key
   */
  @Post()
  @HttpCode(201)
  async createApiKey(
    @Req() req: any,
    @Body() createDto: CreateApiKeyDto,
  ): Promise<ApiKeyWithSecretResponseDto> {
    const userId = req.user?.auth0Id;
    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const apiKey = await this.apiKeyService.createApiKey(
      userId,
      createDto.name,
      createDto.description,
      createDto.expiresAt ? new Date(createDto.expiresAt) : undefined,
    );

    return {
      id: apiKey.id,
      key: apiKey.key,
      name: apiKey.name,
      description: apiKey.description,
      isActive: apiKey.isActive,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
  }

  /**
   * Get all API keys for the authenticated user
   */
  @Get()
  async getApiKeys(@Req() req: any): Promise<ApiKeyListResponseDto> {
    const userId = req.user?.auth0Id;
    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const keys = await this.apiKeyService.getUserApiKeys(userId);
    const activeCount = await this.apiKeyService.countUserActiveKeys(userId);

    return {
      keys: keys.map(key => ({
        id: key.id,
        name: key.name,
        description: key.description,
        isActive: key.isActive,
        lastUsedAt: key.lastUsedAt,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt,
      })),
      total: keys.length,
      active: activeCount,
    };
  }

  /**
   * Get a specific API key by ID
   */
  @Get(':id')
  async getApiKey(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiKeyResponseDto> {
    const userId = req.user?.auth0Id;
    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const apiKey = await this.apiKeyService.getApiKeyById(id, userId);

    return {
      id: apiKey.id,
      name: apiKey.name,
      description: apiKey.description,
      isActive: apiKey.isActive,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
  }

  /**
   * Update an API key
   */
  @Put(':id')
  async updateApiKey(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateApiKeyDto,
  ): Promise<ApiKeyResponseDto> {
    const userId = req.user?.auth0Id;
    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const apiKey = await this.apiKeyService.updateApiKey(id, userId, {
      name: updateDto.name,
      description: updateDto.description,
      expiresAt: updateDto.expiresAt ? new Date(updateDto.expiresAt) : undefined,
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      description: apiKey.description,
      isActive: apiKey.isActive,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
  }

  /**
   * Revoke (deactivate) an API key
   */
  @Post(':id/revoke')
  @HttpCode(200)
  async revokeApiKey(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const userId = req.user?.auth0Id;
    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    await this.apiKeyService.revokeApiKey(id, userId);

    return { message: 'API key revoked successfully' };
  }

  /**
   * Delete an API key permanently
   */
  @Delete(':id')
  @HttpCode(200)
  async deleteApiKey(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const userId = req.user?.auth0Id;
    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    await this.apiKeyService.deleteApiKey(id, userId);

    return { message: 'API key deleted successfully' };
  }
}

