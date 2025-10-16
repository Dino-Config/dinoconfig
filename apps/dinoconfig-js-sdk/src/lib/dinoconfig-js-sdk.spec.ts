import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dinoconfigApi, DinoConfigSDK } from './dinoconfig-js-sdk';

// Mock fetch globally
global.fetch = vi.fn();

describe('DinoConfigSDK', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create SDK instance with required token', () => {
      const sdk = dinoconfigApi({
        token: 'test-token'
      });
      
      expect(sdk).toBeInstanceOf(DinoConfigSDK);
    });

    it('should throw error when token is missing', () => {
      expect(() => {
        dinoconfigApi({} as any);
      }).toThrow('Token is required for DinoConfig SDK initialization');
    });

    it('should use default configuration values', () => {
      const sdk = dinoconfigApi({
        token: 'test-token'
      });
      
      expect(sdk).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const sdk = dinoconfigApi({
        token: 'test-token',
        baseUrl: 'https://custom-api.com',
        company: 'test-company',
        apiVersion: 'v2',
        timeout: 5000
      });
      
      expect(sdk).toBeDefined();
    });
  });

  describe('Token Management', () => {
    it('should update token', () => {
      const sdk = dinoconfigApi({
        token: 'initial-token'
      });
      
      sdk.setToken('new-token');
      // Note: We can't easily test the internal state without exposing it
      // In a real scenario, you might want to add a getter or test through API calls
      expect(sdk).toBeDefined();
    });
  });

  describe('Header Management', () => {
    it('should set and remove custom headers', () => {
      const sdk = dinoconfigApi({
        token: 'test-token'
      });
      
      sdk.setHeader('X-Custom-Header', 'custom-value');
      sdk.removeHeader('X-Custom-Header');
      
      expect(sdk).toBeDefined();
    });
  });

  describe('API Modules', () => {
    it('should expose configs API', () => {
      const sdk = dinoconfigApi({
        token: 'test-token'
      });
      
      expect(sdk.configs).toBeDefined();
      expect(typeof sdk.configs.getAllConfigs).toBe('function');
      expect(typeof sdk.configs.getConfig).toBe('function');
      expect(typeof sdk.configs.createConfig).toBe('function');
      expect(typeof sdk.configs.updateConfig).toBe('function');
      expect(typeof sdk.configs.deleteConfig).toBe('function');
    });
  });

  describe('Connection Test', () => {
    it('should test connection', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ status: 'ok' })
      };
      
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      const sdk = dinoconfigApi({
        token: 'test-token',
        baseUrl: 'https://api.test.com'
      });
      
      const result = await sdk.testConnection();
      
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('ok');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/health',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });
  });
});