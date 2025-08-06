import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dino } from '../entity/dino.entity';

@Injectable()
export class DatabaseProvider implements OnModuleInit {
  constructor(
    @InjectRepository(Dino)
    private readonly dinoRepository: Repository<Dino>,
  ) {}

  async onModuleInit() {
    const count = await this.dinoRepository.count();
    if (count === 0) {
      await this.dinoRepository.save([
        { name: 'Rex', species: 'T-Rex' },
        { name: 'Spike', species: 'Stegosaurus' },
      ]);
      console.log('Dinosaurs seeded to database');
    }
  }
}
