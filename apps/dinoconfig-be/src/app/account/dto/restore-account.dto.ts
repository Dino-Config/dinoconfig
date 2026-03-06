import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { RESTORE_TOKEN_LENGTH } from '../constants/account.constants';

export class RestoreAccountDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(RESTORE_TOKEN_LENGTH, { message: 'Invalid restore token' })
  restoreToken: string;
}
