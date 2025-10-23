import { Config } from '../entities/config.entity';

export class UpdateConfigResponseDto {
  config: Config;
  versions: Config[];
}
