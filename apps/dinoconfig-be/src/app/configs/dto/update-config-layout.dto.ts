import { IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class GridFieldConfigDto {
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
}

export class UpdateConfigLayoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GridFieldConfigDto)
  layout: GridFieldConfigDto[];

  @IsObject()
  formData: Record<string, any>;
}



