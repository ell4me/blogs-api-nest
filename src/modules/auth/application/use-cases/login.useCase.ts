import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SecurityDevicesCreate } from '../../../security-devices/security-devices.types';
import { TokensService } from '../tokens.service';
import { Tokens } from '../../auth.types';
import { SecurityDevicesPgRepository } from '../../../security-devices/infrastructure/security-devices.pg-repository';

export type TExecuteLoginResult = Tokens;

export class LoginCommand {
  constructor(public securityDevicesCreate: SecurityDevicesCreate) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase
  implements ICommandHandler<LoginCommand, TExecuteLoginResult>
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesPgRepository,
    private readonly tokensService: TokensService,
  ) {}

  async execute({ securityDevicesCreate }: LoginCommand) {
    const session = await this.securityDevicesRepository.create(
      securityDevicesCreate,
    );

    return this.tokensService.getTokens(
      session.userId,
      session.deviceId,
      session.iat,
      session.expiration,
    );
  }
}
