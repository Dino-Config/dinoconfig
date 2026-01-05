import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ErrorMessages } from '../constants/error-messages';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  async createFromAuth0(auth0User: { user_id: string; email: string; name?: string; company?: string }): Promise<User> {
    let firstName = '';
    let lastName = '';
    if (auth0User.name && auth0User.name.trim()) {
      const nameParts = auth0User.name.trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    } else {
      const emailParts = auth0User.email.split('@')[0];
      const emailNameParts = emailParts.split(/[._-]/);
      firstName = emailNameParts[0] || 'User';
      lastName = emailNameParts.slice(1).join(' ') || '';
    }

    if (!firstName.trim()) {
      firstName = 'User';
    }

    if (auth0User.company) {
      const existingUser = await this.userRepo.findOne({ 
        where: { companyName: auth0User.company } 
      });
      if (existingUser) {
        throw new ConflictException(`Company name "${auth0User.company}" is already taken. Please choose a different company name.`);
      }
    }

    const user = this.userRepo.create({
      auth0Id: auth0User.user_id,
      email: auth0User.email,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      companyName: auth0User.company || undefined,
    });

    return this.userRepo.save(user);
  }

  async findByAuth0Id(auth0Id: string): Promise<User> {
    return this.userRepo.findOne({ where: { auth0Id }, relations: ['brands'] });
  }

  async updateByAuth0Id(auth0Id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findByAuth0Id(auth0Id);
    if (!user) throw new NotFoundException(ErrorMessages.OPERATION.UNABLE_TO_COMPLETE);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async removeByAuth0Id(auth0Id: string): Promise<void> {
    const result = await this.userRepo.delete({ auth0Id });
    if (result.affected === 0) {
      throw new NotFoundException(ErrorMessages.OPERATION.UNABLE_TO_COMPLETE);
    }
  }

  async updateEmailVerificationStatus(auth0Id: string, emailVerified: boolean): Promise<void> {
    await this.userRepo.update({ auth0Id }, { emailVerified });
  }

  async incrementVerificationResendCount(auth0Id: string): Promise<void> {
    await this.userRepo.increment({ auth0Id }, 'verificationEmailResendCount', 1);
  }
}