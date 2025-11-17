import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, Index, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Config } from '../../configs/entities/config.entity';
import { ConfigDefinition } from '../../configs/entities/config-definition.entity';

@Entity('brands')
@Unique(['user', 'name'])
export class Brand {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, user => user.brands, { onDelete: 'CASCADE' })
  user: User;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  logo?: string;

  @Column({ type: 'text', nullable: true })
  website?: string;

  @Column({ type: 'text', nullable: true })
  company?: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Config, config => config.brand)
  configs: Config[];

  @OneToMany(() => ConfigDefinition, definition => definition.brand)
  configDefinitions: ConfigDefinition[];
}