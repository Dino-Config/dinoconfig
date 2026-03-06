import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CloseAccountDto } from './dto/close-account.dto';
import { RestoreAccountDto } from './dto/restore-account.dto';
import { UserAuthGuard } from '../security/guard/user-auth.guard';
import { AccountClosureRateLimitGuard } from './guards/account-closure-rate-limit.guard';
import { AuthenticatedRequest } from './account.controller.types';
import { getRequestLogContext, RequestWithCorrelation } from '../logging/logging.types';

@Controller('account')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AccountController {
  private readonly logger = new Logger(AccountController.name);

  constructor(private readonly accountService: AccountService) {}

  @Post('close')
  @HttpCode(HttpStatus.OK)
  @UseGuards(UserAuthGuard, AccountClosureRateLimitGuard)
  async close(@Req() req: AuthenticatedRequest, @Body() dto: CloseAccountDto) {
    this.logger.log({ message: 'Account close requested', ...getRequestLogContext(req) });
    return this.accountService.closeAccount(req.user.auth0Id, dto.password, req);
  }

  @Post('restore')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccountClosureRateLimitGuard)
  async restore(@Req() req: RequestWithCorrelation, @Body() dto: RestoreAccountDto) {
    this.logger.log({ message: 'Account restore requested', ...getRequestLogContext(req) });
    return this.accountService.restoreAccountByToken(dto.restoreToken);
  }
}
