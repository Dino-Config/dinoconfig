import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Config, GridFieldConfig } from '../models/config.models';

export interface ConfigVersionsResponse {
  activeVersion: Config | null;
  versions: Config[];
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getConfigDefinitions(brandId: number): Observable<Config[]> {
    return this.http.get<Config[]>(
      `${this.apiUrl}/brands/${brandId}/config-definitions`,
      { withCredentials: true }
    );
  }

  getConfigVersions(brandId: number, configId: number): Observable<ConfigVersionsResponse> {
    return this.http.get<ConfigVersionsResponse>(
      `${this.apiUrl}/brands/${brandId}/configs/${configId}/versions`,
      { withCredentials: true }
    );
  }

  setActiveVersion(brandId: number, configName: string, version: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/brands/${brandId}/configs/${configName}/active-version`,
      { version },
      { withCredentials: true }
    );
  }

  createConfig(brandId: number, configData: Partial<Config>): Observable<Config> {
    return this.http.post<Config>(
      `${this.apiUrl}/brands/${brandId}/configs`,
      {
        name: configData.name,
        description: configData.description || '',
        formData: configData.formData || {},
        layout: configData.layout || undefined
      },
      { withCredentials: true }
    );
  }

  updateConfigName(brandId: number, configDefinitionId: number, newName: string): Observable<Config> {
    return this.http.patch<Config>(
      `${this.apiUrl}/brands/${brandId}/config-definitions/${configDefinitionId}`,
      { name: newName.trim() },
      { withCredentials: true }
    );
  }

  deleteConfig(brandId: number, configId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/brands/${brandId}/configs/${configId}/definition`,
      { withCredentials: true }
    );
  }

  updateConfigLayout(
    brandId: number,
    configId: number,
    layoutData: { layout: GridFieldConfig[]; formData: Record<string, any> }
  ): Observable<{ config: Config; versions: Config[] }> {
    return this.http.patch<{ config: Config; versions: Config[] }>(
      `${this.apiUrl}/brands/${brandId}/configs/${configId}/layout`,
      layoutData,
      { withCredentials: true }
    );
  }
}

