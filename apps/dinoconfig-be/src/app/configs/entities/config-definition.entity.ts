import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { Config } from './config.entity';

@Entity('config_definitions')
@Unique(['brand', 'name', 'company'])
export class ConfigDefinition {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Brand, brand => brand.configDefinitions, { onDelete: 'CASCADE' })
  brand: Brand;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  company?: string;

  @OneToMany(() => Config, config => config.definition)
  configs: Config[];
}


