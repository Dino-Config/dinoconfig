import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { dinoconfigApi, DinoConfigInstance } from './dinoconfig-js-sdk';

// Mock fetch globally
global.fetch = vi.fn();

describe('dinoconfigApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTokenExchange = () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        access_token: 'test-access-token',
        expires_in: 3600,
        token_type: 'Bearer',
      }),
    });
  };

  describe('Initialization', () => {
    it('should create SDK instance with required apiKey', async () => {
      mockTokenExchange();

      const dinoconfig = await dinoconfigApi({
        apiKey: 'test-api-key',
      });

      expect(dinoconfig).toBeDefined();
      expect(dinoconfig.configs).toBeDefined();
    });

    it('should exchange API key for token during initialization', async () => {
      mockTokenExchange();

      await dinoconfigApi({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.test.com',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/api/auth/sdk-token/exchange',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-api-key',
          }),
        })
      );
    });

    it('should use default baseUrl when not provided', async () => {
      mockTokenExchange();

      await dinoconfigApi({
        apiKey: 'test-api-key',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/sdk-token/exchange',
        expect.any(Object)
      );
    });

    it('should accept custom configuration', async () => {
      mockTokenExchange();

      const dinoconfig = await dinoconfigApi({
        apiKey: 'test-api-key',
        baseUrl: 'https://custom-api.com',
        timeout: 5000,
      });

      expect(dinoconfig).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://custom-api.com/api/auth/sdk-token/exchange',
        expect.any(Object)
      );
    });

    it('should throw error when token exchange fails', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: vi.fn().mockResolvedValue('Invalid API key'),
      });

      await expect(
        dinoconfigApi({
          apiKey: 'invalid-api-key',
        })
      ).rejects.toThrow('Failed to exchange API key for token');
    });
  });

  describe('API Modules', () => {
    it('should expose configs API with getConfigValue method', async () => {
      mockTokenExchange();

      const dinoconfig = await dinoconfigApi({
        apiKey: 'test-api-key',
      });

      expect(dinoconfig.configs).toBeDefined();
      expect(typeof dinoconfig.configs.getConfigValue).toBe('function');
    });

    it('should use the access token for API calls', async () => {
      mockTokenExchange();

      const dinoconfig = await dinoconfigApi({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.test.com',
      });

      // Mock the config API call
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ value: 'test-value' }),
      });

      await dinoconfig.configs.getConfigValue('brand', 'config', 'key');

      // Second call should be the config API call with Bearer token
      expect(global.fetch).toHaveBeenLastCalledWith(
        'https://api.test.com/api/sdk/brands/brand/configs/config/key',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-access-token',
          }),
        })
      );
    });
  });
});
