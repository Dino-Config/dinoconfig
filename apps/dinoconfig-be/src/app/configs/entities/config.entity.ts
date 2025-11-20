// config.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index, JoinColumn } from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { ConfigDefinition } from './config-definition.entity';

@Entity('configs')
@Index(['brand', 'definition', 'version'], { unique: true })
export class Config {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Brand, brand => brand.configs, { onDelete: 'CASCADE' })
  brand: Brand;

  @ManyToOne(() => ConfigDefinition, definition => definition.configs, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'config_definition_id' })
  definition?: ConfigDefinition;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb' })
  formData: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  schema?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  uiSchema?: Record<string, any>;

  @Column({ type: 'int' })
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  name: string;

  company?: string;
}
