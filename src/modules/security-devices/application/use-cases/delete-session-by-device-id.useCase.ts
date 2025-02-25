import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../common/exception/domain-exception';
import { SecurityDevicesOrmRepository } from '../../infrastructure/orm/security-devices.orm-repository';

export type TExecuteDeleteSessionByDeviceIdResult = void;

export class DeleteSessionByDeviceIdCommand {
  constructor(
    public deviceId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteSessionByDeviceIdCommand)
export class DeleteSessionByDeviceIdUseCase
  implements
    ICommandHandler<
      DeleteSessionByDeviceIdCommand,
      TExecuteDeleteSessionByDeviceIdResult
    >
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesOrmRepository,
  ) {}

  async execute({ deviceId, userId }: DeleteSessionByDeviceIdCommand) {
    const currentDeviceSession =
      await this.securityDevicesRepository.getDeviceSession(deviceId);

    if (!currentDeviceSession) {
      throw NotFoundDomainException.create();
    }

    if (currentDeviceSession.userId !== userId) {
      throw ForbiddenDomainException.create();
    }

    await this.securityDevicesRepository.deleteByDeviceId(deviceId);

    return;
  }
}
