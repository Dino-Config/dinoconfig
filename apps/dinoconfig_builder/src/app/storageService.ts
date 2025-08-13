// storageService.ts
export interface SavedConfig {
    id: string;
    name: string;
    schema: any;
    uiSchema: any;
    formData: any;
    createdAt: string;
    updatedAt: string;
  }
  
  const KEY_PREFIX = "dyncfg:"; // dyncfg:<companyId>
  
  export function loadConfigs(companyId: string): SavedConfig[] {
    const raw = localStorage.getItem(KEY_PREFIX + companyId);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as SavedConfig[];
    } catch {
      return [];
    }
  }
  
  export function saveConfigs(companyId: string, configs: SavedConfig[]) {
    localStorage.setItem(KEY_PREFIX + companyId, JSON.stringify(configs));
  }
  
  export function createConfig(companyId: string, config: Omit<SavedConfig, "id" | "createdAt" | "updatedAt">) {
    const configs = loadConfigs(companyId);
    const id = Math.random().toString(36).slice(2, 9);
    const now = new Date().toISOString();
    const newConfig: SavedConfig = { id, createdAt: now, updatedAt: now, ...config };
    configs.push(newConfig);
    saveConfigs(companyId, configs);
    return newConfig;
  }
  
  export function updateConfig(companyId: string, id: string, patch: Partial<SavedConfig>) {
    const configs = loadConfigs(companyId);
    const idx = configs.findIndex(c => c.id === id);
    if (idx === -1) return null;
    configs[idx] = { ...configs[idx], ...patch, updatedAt: new Date().toISOString() };
    saveConfigs(companyId, configs);
    return configs[idx];
  }
  
  export function deleteConfig(companyId: string, id: string) {
    const configs = loadConfigs(companyId);
    const filtered = configs.filter(c => c.id !== id);
    saveConfigs(companyId, filtered);
    return filtered;
  }
  