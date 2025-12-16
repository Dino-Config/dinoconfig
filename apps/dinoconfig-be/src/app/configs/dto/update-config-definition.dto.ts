import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateConfigDefinitionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  company?: string;
}

