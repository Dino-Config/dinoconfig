import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEvent, AccountEventType } from './entities/account-event.entity';

@Injectable()
export class AccountEventsService {
  private readonly logger = new Logger(AccountEventsService.name);

  constructor(
    @InjectRepository(AccountEvent)
    private readonly accountEventRepo: Repository<AccountEvent>,
  ) {}

  async log(
    accountId: number,
    eventType: AccountEventType,
    metadata?: Record<string, unknown>,
  ): Promise<AccountEvent> {
    const event = this.accountEventRepo.create({
      accountId,
      eventType,
      metadata: metadata ?? undefined,
    });
    const saved = await this.accountEventRepo.save(event);
    this.logger.debug({ message: 'Account event logged', eventType, accountId });
    return saved;
  }
}
