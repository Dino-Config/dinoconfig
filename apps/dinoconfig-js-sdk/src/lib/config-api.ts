import { HttpClient } from './http-client';
import { Config, ApiResponse, RequestOptions } from './types';

export class ConfigAPI {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get configuration by name (helper method)
   */
  async getConfigByName(
    brandId: number,
    configName: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Config | null>> {
    try {
      const response = await this.httpClient.get<Config[]>(`/api/brands/${brandId}/configs`, options);
      const config = response.data.find(c => c.name === configName);
      
      return {
        data: config || null,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }
}
