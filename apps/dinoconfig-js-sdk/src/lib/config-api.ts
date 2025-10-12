import { HttpClient } from './http-client';
import { Config, ApiResponse, RequestOptions } from './types';

export class ConfigAPI {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get all configurations for a specific brand
   */
  async getAllConfigs(brandId: number, options?: RequestOptions): Promise<ApiResponse<Config[]>> {
    return this.httpClient.get<Config[]>(`/api/brands/${brandId}/configs`, options);
  }

  /**
   * Get a specific configuration by ID
   */
  async getConfig(
    brandId: number, 
    configId: number, 
    options?: RequestOptions
  ): Promise<ApiResponse<Config>> {
    return this.httpClient.get<Config>(`/brands/${brandId}/configs/${configId}`, options);
  }

  /**
   * Get configuration by name (helper method)
   */
  async getConfigByName(
    brandId: number,
    configName: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Config | null>> {
    try {
      const response = await this.getAllConfigs(brandId, options);
      const config = response.data.find(c => c.name === configName);
      
      return {
        data: config || null,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get configurations by company (helper method)
   */
  async getConfigsByCompany(
    brandId: number,
    company: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Config[]>> {
    try {
      const response = await this.getAllConfigs(brandId, options);
      const filteredConfigs = response.data.filter(c => c.company === company);
      
      return {
        data: filteredConfigs,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }
}
