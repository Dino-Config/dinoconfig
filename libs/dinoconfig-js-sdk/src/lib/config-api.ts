import { HttpClient } from './http-client';
import { ApiResponse, RequestOptions } from './types';

export class ConfigAPI {
  constructor(private httpClient: HttpClient) {}

  async getConfigValue(
    brandName: string,
    configName: string,
    configValueKey: string,
    options?: RequestOptions
  ): Promise<ApiResponse<any>> {
    try {
      const response = await this.httpClient.get<any>(`/api/sdk/brands/${brandName}/configs/${configName}/${configValueKey}`, options);
      return response;      
    } catch (error) {
      throw error;
    }
  }
}
