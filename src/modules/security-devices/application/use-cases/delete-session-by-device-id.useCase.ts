import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../../../../common/exception/domain-exception';
import { SecurityDevicesPgRepository } from '../../infrastructure/pg/security-devices.pg-repository';

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
    private readonly securityDevicesRepository: SecurityDevicesPgRepository,
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
