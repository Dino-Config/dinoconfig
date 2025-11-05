import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { MachineAuthGuard } from '../security/guard/machine-auth.guard';
import { ScopesGuard } from '../security/guard/scope.guard';
import { Scopes } from '../security/decorators/scope.decorator';
import { ConfigsService } from './config.service';

@Controller('sdk/brands')
@UseGuards(MachineAuthGuard, ScopesGuard)
export class SdkConfigsController {
  constructor(
    private readonly configsService: ConfigsService,
  ) {}

  @Get(':brandName/configs/:name/:valueKey')
  @Scopes('read:configs')
  findConfigByNameAndValue(
    @Request() req,
    @Param('brandName') brandName: string,
    @Param('name') name: string,
    @Param('valueKey') valueKey: string,
  ) {
    return this.configsService.findConfigByNameAndValueForSDK(
      brandName,
      name,
      valueKey,
      req.user?.company,
    );
  }
}

