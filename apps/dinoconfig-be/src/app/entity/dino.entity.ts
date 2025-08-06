import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dino')
export class Dino {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  species: string;
}
