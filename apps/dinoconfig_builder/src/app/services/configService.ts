import axios from 'axios';
import { Config, GridFieldConfig, Brand } from '../types';

const API_BASE_URL = process.env['NX_API_URL'] || 'http://localhost:3000/api';

export class ConfigService {
  static async getBrand(brandId: number): Promise<Brand> {
    const response = await axios.get(`${API_BASE_URL}/brands/${brandId}`);
    return response.data;
  }

  static async getConfigDefinitions(brandId: number): Promise<Config[]> {
    const response = await axios.get(`${API_BASE_URL}/brands/${brandId}/config-definitions`);
    return response.data;
  }

  static async createConfig(brandId: number, data: { name: string }): Promise<Config> {
    const response = await axios.post(`${API_BASE_URL}/brands/${brandId}/configs`, data);
    return response.data;
  }

  static async updateConfig(
    brandId: number,
    configId: number,
    data: {
      formData?: Record<string, any>;
      schema?: Record<string, any>;
      uiSchema?: Record<string, any>;
    }
  ): Promise<{ config: Config; versions: Config[] }> {
    const response = await axios.patch(
      `${API_BASE_URL}/brands/${brandId}/configs/${configId}`,
      data
    );
    return response.data;
  }

  static async updateConfigName(
    brandId: number,
    configId: number,
    name: string
  ): Promise<Config> {
    const response = await axios.patch(
      `${API_BASE_URL}/brands/${brandId}/configs/${configId}/name`,
      { name }
    );
    return response.data;
  }

  static async deleteConfig(brandId: number, configId: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/brands/${brandId}/configs/${configId}`);
  }

  static async setActiveVersion(
    brandId: number,
    configName: string,
    version: number
  ): Promise<void> {
    await axios.patch(
      `${API_BASE_URL}/brands/${brandId}/configs/${configName}/active`,
      { version }
    );
  }

  static async updateField(
    brandId: number,
    configId: number,
    fieldName: string,
    fieldData: any
  ): Promise<{ config: Config; versions: Config[] }> {
    const response = await axios.patch(
      `${API_BASE_URL}/brands/${brandId}/configs/${configId}/fields/${fieldName}`,
      fieldData
    );
    return response.data;
  }

  static async deleteField(
    brandId: number,
    configId: number,
    fieldName: string
  ): Promise<{ config: Config; versions: Config[] }> {
    const response = await axios.delete(
      `${API_BASE_URL}/brands/${brandId}/configs/${configId}/fields/${fieldName}`
    );
    return response.data;
  }

  static async updateConfigLayout(
    brandId: number,
    configId: number,
    data: {
      layout: GridFieldConfig[];
      formData: Record<string, any>;
    }
  ): Promise<{ config: Config; versions: Config[] }> {
    const response = await axios.patch(
      `${API_BASE_URL}/brands/${brandId}/configs/${configId}/layout`,
      data
    );
    return response.data;
  }

  static async getConfig(
    brandId: number,
    configId: number
  ): Promise<Config> {
    const response = await axios.get(
      `${API_BASE_URL}/brands/${brandId}/configs/${configId}`
    );
    return response.data;
  }

  static async getConfigVersions(
    brandId: number,
    configId: number
  ): Promise<Config[]> {
    const response = await axios.get(
      `${API_BASE_URL}/brands/${brandId}/configs/${configId}/versions`
    );
    return response.data;
  }
}
