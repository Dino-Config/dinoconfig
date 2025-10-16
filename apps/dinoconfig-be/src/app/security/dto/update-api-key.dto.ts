import { IsString, IsOptional, IsDateString, MinLength, MaxLength } from 'class-validator';

export class UpdateApiKeyDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}


