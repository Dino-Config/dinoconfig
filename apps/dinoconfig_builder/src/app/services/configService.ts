import axios from "../auth/axios-interceptor";
import { environment } from "../../environments";
import { Config, Brand } from "../types";

export class ConfigService {
  static async getBrands(): Promise<Brand[]> {
    const response = await axios.get(`${environment.apiUrl}/brands`, {
      withCredentials: true
    });
    
    // Handle both array response and object with brands + limitViolations
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.brands && Array.isArray(response.data.brands)) {
      return response.data.brands;
    } else {
      return [];
    }
  }

  static async getBrand(brandId: number): Promise<Brand> {
    const brands = await this.getBrands();
    const brand = brands.find((b: Brand) => b.id === brandId);
    if (!brand) {
      throw new Error('Brand not found');
    }
    return brand;
  }

  /**
   * Get all config definitions for the sidebar
   * Returns definitions with their active config info
   */
  static async getConfigDefinitions(brandId: number): Promise<Config[]> {
    const response = await axios.get(`${environment.apiUrl}/brands/${brandId}/config-definitions`, {
      withCredentials: true
    });
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * @deprecated Use getConfigDefinitions instead. This endpoint still works but returns configs, not definitions.
   */
  static async getConfigs(brandId: number): Promise<Config[]> {
    const response = await axios.get(`${environment.apiUrl}/brands/${brandId}/configs`, {
      withCredentials: true
    });
    
    // Handle both array response and object with configs + limitViolations
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.configs && Array.isArray(response.data.configs)) {
      return response.data.configs;
    } else {
      return [];
    }
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

  /**
   * Updates config content (description, formData, schema, uiSchema)
   * Note: Use updateConfigName() to rename a config without creating a new version
   */
  static async updateConfig(brandId: number, configId: number, configData: Partial<Config>): Promise<{config: Config, versions: Config[]}> {
    // Remove name from configData if present - name updates should use updateConfigName()
    const { name, ...contentData } = configData;
    
    const response = await axios.patch(`${environment.apiUrl}/brands/${brandId}/configs/${configId}`, contentData, {
      withCredentials: true
    });
    return response.data;
  }

  /**
   * Updates the name of a config definition without creating a new version
   */
  static async updateConfigName(brandId: number, configId: number, newName: string): Promise<Config> {
    const response = await axios.patch(
      `${environment.apiUrl}/brands/${brandId}/configs/${configId}/name`,
      { name: newName.trim() },
      {
        withCredentials: true
      }
    );
    return response.data;
  }

  /**
   * Delete a config definition and all its configs via config ID
   */
  static async deleteConfig(brandId: number, configId: number): Promise<void> {
    await axios.delete(`${environment.apiUrl}/brands/${brandId}/configs/${configId}/definition`, {
      withCredentials: true
    });
  }

  /**
   * Delete a config definition and all its configs via definition ID
   */
  static async deleteConfigDefinition(brandId: number, definitionId: number): Promise<void> {
    await axios.delete(`${environment.apiUrl}/brands/${brandId}/config-definitions/${definitionId}`, {
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

  static async updateField(
    brandId: number,
    configId: number,
    fieldName: string,
    payload: {
      name: string;
      label?: string;
      type: string;
      options?: string;
      required?: boolean;
      min?: number;
      max?: number;
      maxLength?: number;
      pattern?: string;
    }
  ): Promise<{ config: Config; versions: Config[] }> {
    const response = await axios.patch(
      `${environment.apiUrl}/brands/${brandId}/configs/${configId}/fields/${encodeURIComponent(fieldName)}`,
      payload,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }

  static async deleteField(
    brandId: number,
    configId: number,
    fieldName: string
  ): Promise<{ config: Config; versions: Config[] }> {
    const response = await axios.delete(
      `${environment.apiUrl}/brands/${brandId}/configs/${configId}/fields/${encodeURIComponent(fieldName)}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
}

