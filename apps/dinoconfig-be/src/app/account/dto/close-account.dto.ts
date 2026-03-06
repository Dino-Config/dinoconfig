import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CloseAccountDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}
