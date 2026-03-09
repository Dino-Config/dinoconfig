import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as crypto from 'crypto';
import { User, AccountStatus } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ErrorMessages } from '../constants/error-messages';
import { ACCOUNT_GRACE_DAYS } from '../account/constants/account.constants';

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

  async findByAuth0Id(auth0Id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { auth0Id }, relations: ['brands'] });
  }

  async findActiveByAuth0Id(auth0Id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { auth0Id, status: AccountStatus.ACTIVE },
      relations: ['brands'],
    });
  }

  /** Close account: set status=closed, deletedAt=now, deletionScheduledAt=now+ACCOUNT_GRACE_DAYS */
  async closeAccount(auth0Id: string): Promise<User> {
    const user = await this.findByAuth0Id(auth0Id);
    if (!user) throw new NotFoundException(ErrorMessages.OPERATION.UNABLE_TO_COMPLETE);
    if (user.status === AccountStatus.CLOSED) {
      throw new BadRequestException(ErrorMessages.ACCOUNT.ALREADY_CLOSED);
    }
    const now = new Date();
    const deletionScheduledAt = new Date(now);
    deletionScheduledAt.setDate(deletionScheduledAt.getDate() + ACCOUNT_GRACE_DAYS);
    user.status = AccountStatus.CLOSED;
    user.deletedAt = now;
    user.deletionScheduledAt = deletionScheduledAt;
    user.restoreToken = crypto.randomBytes(32).toString('hex');
    return this.userRepo.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id }, relations: ['brands'] });
  }

  findByRestoreToken(restoreToken: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { restoreToken },
      relations: ['brands'],
    });
  }

  /** Restore account: only if status=closed and deletionScheduledAt > now. Uses restoreToken (set at close). */
  async restoreByRestoreToken(restoreToken: string): Promise<User> {
    const user = await this.findByRestoreToken(restoreToken);
    if (!user) throw new NotFoundException(ErrorMessages.ACCOUNT.NOT_ELIGIBLE_FOR_RESTORE);
    if (user.status !== AccountStatus.CLOSED) {
      throw new BadRequestException(ErrorMessages.ACCOUNT.NOT_ELIGIBLE_FOR_RESTORE);
    }
    if (!user.deletionScheduledAt || user.deletionScheduledAt <= new Date()) {
      throw new BadRequestException(ErrorMessages.ACCOUNT.NOT_ELIGIBLE_FOR_RESTORE);
    }
    return this.applyRestore(user);
  }

  /** Restore account by auth0Id (for authenticated flow - e.g. support unblocked user). */
  async restoreAccount(auth0Id: string): Promise<User> {
    const user = await this.findByAuth0Id(auth0Id);
    if (!user) throw new NotFoundException(ErrorMessages.OPERATION.UNABLE_TO_COMPLETE);
    if (user.status !== AccountStatus.CLOSED) {
      throw new BadRequestException(ErrorMessages.ACCOUNT.NOT_ELIGIBLE_FOR_RESTORE);
    }
    if (!user.deletionScheduledAt || user.deletionScheduledAt <= new Date()) {
      throw new BadRequestException(ErrorMessages.ACCOUNT.NOT_ELIGIBLE_FOR_RESTORE);
    }
    return this.applyRestore(user);
  }

  private applyRestore(user: User): Promise<User> {
    user.status = AccountStatus.ACTIVE;
    user.deletedAt = undefined;
    user.deletionScheduledAt = undefined;
    user.restoreToken = undefined;
    return this.userRepo.save(user);
  }

  /** Find users that are closed and past their deletion date (for permanent deletion worker) */
  async findClosedEligibleForPermanentDeletion(): Promise<User[]> {
    return this.userRepo.find({
      where: {
        status: AccountStatus.CLOSED,
        deletionScheduledAt: LessThan(new Date()),
      },
      relations: ['brands', 'apiKeys'],
    });
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