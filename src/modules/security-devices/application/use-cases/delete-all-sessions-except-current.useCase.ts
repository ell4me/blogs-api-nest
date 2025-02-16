import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SecurityDevicesPgRepository } from '../../infrastructure/pg/security-devices.pg-repository';

export type TExecuteDeleteAllSessionsExceptCurrentResult = void;

export class DeleteAllSessionsExceptCurrentCommand {
  constructor(
    public deviceId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteAllSessionsExceptCurrentCommand)
export class DeleteAllSessionsExceptCurrentUseCase
  implements
    ICommandHandler<
      DeleteAllSessionsExceptCurrentCommand,
      TExecuteDeleteAllSessionsExceptCurrentResult
    >
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesPgRepository,
  ) {}

  async execute({ deviceId, userId }: DeleteAllSessionsExceptCurrentCommand) {
    await this.securityDevicesRepository.deleteAllExceptCurrent(
      userId,
      deviceId,
    );

    return;
  }
}
