import axios from "../auth/axios-interceptor";
import { environment } from "../../environments";
import { Config, Brand } from "../types";

export class ConfigService {
  static async getBrands(): Promise<Brand[]> {
    const response = await axios.get(`${environment.apiUrl}/brands`, {
      withCredentials: true
    });
    return response.data;
  }

  static async getBrand(brandId: number): Promise<Brand> {
    const brands = await this.getBrands();
    const brand = brands.find((b: Brand) => b.id === brandId);
    if (!brand) {
      throw new Error('Brand not found');
    }
    return brand;
  }

  static async getConfigs(brandId: number): Promise<Config[]> {
    const response = await axios.get(`${environment.apiUrl}/brands/${brandId}/configs`, {
      withCredentials: true
    });
    return response.data;
  }

  static async createConfig(brandId: number, configData: Partial<Config>): Promise<Config> {
    const response = await axios.post(`${environment.apiUrl}/brands/${brandId}/configs`, {
      name: configData.name,
      description: configData.description || '',
      formData: configData.formData || {},
      schema: configData.schema || { type: "object", properties: {}, required: [] },
      uiSchema: configData.uiSchema || {}
    }, {
      withCredentials: true
    });
    return response.data;
  }

  static async updateConfig(brandId: number, configId: number, configData: Partial<Config>): Promise<{config: Config, versions: Config[]}> {
    const response = await axios.patch(`${environment.apiUrl}/brands/${brandId}/configs/${configId}`, configData, {
      withCredentials: true
    });
    return response.data;
  }

  static async deleteConfig(brandId: number, configId: number): Promise<void> {
    await axios.delete(`${environment.apiUrl}/brands/${brandId}/configs/${configId}`, {
      withCredentials: true
    });
  }

  static async getConfigVersions(brandId: number, configId: number): Promise<Config[]> {
    const response = await axios.get(`${environment.apiUrl}/brands/${brandId}/configs/${configId}/versions`, {
      withCredentials: true
    });
    return response.data;
  }


  static async getActiveConfig(brandId: number, configName: string): Promise<Config | null> {
    const response = await axios.get(`${environment.apiUrl}/brands/${brandId}/configs/${configName}/active`, {
      withCredentials: true
    });
    return response.data;
  }

  static async setActiveVersion(brandId: number, configName: string, version: number): Promise<void> {
    await axios.patch(`${environment.apiUrl}/brands/${brandId}/configs/${configName}/active-version`, {
      version: version
    }, {
      withCredentials: true
    });
  }
}

