import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreateConfigDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  formData: Record<string, any>;

  @IsOptional()
  @IsArray()
  layout?: Array<{
    id: string;
    name: string;
    type: string;
    label?: string;
    options?: string;
    required?: boolean;
    min?: number;
    max?: number;
    maxLength?: number;
    pattern?: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
}