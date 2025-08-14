import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateConfigDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  data: Record<string, any>;
}