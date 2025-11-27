export type FieldType =
  | "text"
  | "password"
  | "select"
  | "checkbox"
  | "radio"
  | "number"
  | "textarea"
  | "email"
  | "range"
  | "url"
  | "tel"
  | "search"
  | "time"
  | "datetime-local"
  | "month"
  | "week"
  | "date";

export interface FieldConfig {
  name: string;
  type: FieldType;
  label?: string;
  options?: string;
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  pattern?: string;
}

export interface GridFieldConfig extends FieldConfig {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Config {
  id: number;
  name: string;
  description?: string;
  formData: Record<string, any>;
  layout?: GridFieldConfig[];
  version: number;
  createdAt: string;
}

