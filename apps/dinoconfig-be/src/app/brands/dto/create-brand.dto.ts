import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBrandDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsString()
  company: string;
}