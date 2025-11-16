import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index, Unique, JoinColumn } from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { ConfigDefinition } from './config-definition.entity';

@Entity('active_versions')
@Unique(['brand', 'configDefinition', 'company'])
@Index(['brand', 'configDefinition', 'company'])
export class ActiveVersion {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Brand, { onDelete: 'CASCADE' })
  brand: Brand;

  @ManyToOne(() => ConfigDefinition, { onDelete: 'CASCADE', eager: true, nullable: true })
  @JoinColumn({ name: 'config_definition_id' })
  configDefinition?: ConfigDefinition;

  @Column({ length: 255 })
  configName: string;

  @Column({ type: 'text', nullable: true })
  company?: string;

  @Column({ type: 'int' })
  activeVersion: number;

  @CreateDateColumn()
  createdAt: Date;
}
