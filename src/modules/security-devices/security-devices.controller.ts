import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRequest } from '../../types';
import { ROUTERS_PATH } from '../../constants';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';

import { SecurityDevicesViewDto } from './security-devices.dto';
import {
  DeleteAllSessionsExceptCurrentCommand,
  TExecuteDeleteAllSessionsExceptCurrentResult,
} from './application/use-cases/delete-all-sessions-except-current.useCase';
import {
  DeleteSessionByDeviceIdCommand,
  TExecuteDeleteSessionByDeviceIdResult,
} from './application/use-cases/delete-session-by-device-id.useCase';
import { SecurityDevicesPgQueryRepository } from './infrastructure/security-devices.pg-query-repository';

@UseGuards(RefreshTokenGuard)
@Controller(ROUTERS_PATH.SECURITY_DEVICES)
export class SecurityDevicesController {
  constructor(
    private readonly securityDevicesQueryRepository: SecurityDevicesPgQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  getActiveDeviceSessions(
    @CurrentUser('id') userId: string,
  ): Promise<SecurityDevicesViewDto[]> {
    return this.securityDevicesQueryRepository.getActiveDeviceSessions(userId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  async deleteAllDeviceSessionsExceptCurrent(
    @CurrentUser() user: UserRequest,
  ): Promise<void> {
    return this.commandBus.execute<
      DeleteAllSessionsExceptCurrentCommand,
      TExecuteDeleteAllSessionsExceptCurrentResult
    >(new DeleteAllSessionsExceptCurrentCommand(user.deviceId!, user.id));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':deviceId')
  deleteSessionByDeviceId(
    @CurrentUser('id') userId: string,
    @Param('deviceId') deviceId: string,
  ): Promise<void> {
    return this.commandBus.execute<
      DeleteSessionByDeviceIdCommand,
      TExecuteDeleteSessionByDeviceIdResult
    >(new DeleteSessionByDeviceIdCommand(deviceId, userId));
  }
}
