// config.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';

@Entity('configs')
export class Config {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Brand, brand => brand.configs, { onDelete: 'CASCADE' })
  brand: Brand;

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
