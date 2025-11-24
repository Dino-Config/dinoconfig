export interface Config {
  id: number;
  name: string;
  description?: string;
  formData: Record<string, any>;
  schema?: Record<string, any>;
  uiSchema?: Record<string, any>;
  version: number;
  createdAt: string;
}

