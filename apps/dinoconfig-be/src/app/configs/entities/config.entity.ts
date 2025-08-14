// config.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';

@Entity('configs')
@Index(['brand', 'configKey', 'version'], { unique: true })
export class Config {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Brand, brand => brand.configs, { onDelete: 'CASCADE' })
  brand: Brand;

  // Logical identifier for the config (so we can have multiple versions for the same "config")
  @Column({ length: 255 })
  configKey: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @Column({ type: 'int' })
  version: number;

  @CreateDateColumn()
  createdAt: Date;
}
