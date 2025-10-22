import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index, Unique } from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';

@Entity('active_versions')
@Unique(['brand', 'configName', 'company'])
@Index(['brand', 'configName', 'company'])
export class ActiveVersion {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Brand, { onDelete: 'CASCADE' })
  brand: Brand;

  @Column({ length: 255 })
  configName: string;

  @Column({ type: 'text', nullable: true })
  company?: string;

  @Column({ type: 'int' })
  activeVersion: number;

  @CreateDateColumn()
  createdAt: Date;
}
