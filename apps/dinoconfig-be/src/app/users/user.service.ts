import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  async createFromAuth0(auth0User: { user_id: string; email: string; name?: string; company?: string }): Promise<User> {
    const [firstName, ...rest] = (auth0User.name || '').split(' ');
    const lastName = rest.join(' ') || '';

    const user = this.userRepo.create({
      auth0Id: auth0User.user_id,
      email: auth0User.email,
      firstName,
      lastName,
      companyName: auth0User.company || undefined,
    });

    return this.userRepo.save(user);
  }

  async findByAuth0Id(auth0Id: string): Promise<User> {
    return this.userRepo.findOne({ where: { auth0Id }, relations: ['brands'] });
  }

  async updateByAuth0Id(auth0Id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findByAuth0Id(auth0Id);
    if (!user) throw new NotFoundException(`User not found`);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async removeByAuth0Id(auth0Id: string): Promise<void> {
    const result = await this.userRepo.delete({ auth0Id });
    if (result.affected === 0) {
      throw new NotFoundException(`User not found`);
    }
  }
}