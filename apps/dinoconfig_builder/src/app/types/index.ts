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
  | "date"
  | "datetime-local"
  | "month"
  | "week";

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
  schema?: Record<string, any>;
  uiSchema?: Record<string, any>;
  layout?: GridFieldConfig[]; // Grid layout for drag-and-drop form builder
  version: number;
  createdAt: string;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
}

export interface User {
  id: number;
  auth0Id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  isActive: boolean;
  emailVerified: boolean;
  verificationEmailResendCount: number;
  companyName?: string;
  createdAt: Date;
  brands: Brand[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface PromptDialog {
  isOpen: boolean;
  title: string;
  message: string;
  defaultValue: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export { Feature, type FeatureMap } from './features';
