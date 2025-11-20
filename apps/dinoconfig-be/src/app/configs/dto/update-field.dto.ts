import { IsBoolean, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export const FIELD_TYPES = [
  'text',
  'password',
  'select',
  'checkbox',
  'radio',
  'number',
  'textarea',
  'email',
  'range',
  'url',
  'tel',
  'search',
  'time',
  'datetime-local',
  'month',
  'week',
] as const;

export type FieldType = typeof FIELD_TYPES[number];

export class UpdateFieldDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  label?: string;

  @IsIn(FIELD_TYPES)
  type: FieldType;

  @IsOptional()
  @IsString()
  options?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxLength?: number;

  @IsOptional()
  @IsString()
  pattern?: string;
}





