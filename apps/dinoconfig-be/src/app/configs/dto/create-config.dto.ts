import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateConfigDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  formData: Record<string, any>;

  @IsOptional()
  @IsObject()
  schema?: Record<string, any>;

  @IsOptional()
  @IsObject()
  uiSchema?: Record<string, any>;
}