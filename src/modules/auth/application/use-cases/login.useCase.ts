import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { addSeconds } from 'date-fns/addSeconds';

import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { SecurityDevicesCreate } from '../../../security-devices/security-devices.types';
import { EXPIRATION_TOKEN } from '../../../../constants';
import { SecurityDevicesWithoutMethods } from '../../../security-devices/infrastructure/security-devices.model';
import { TokensService } from '../tokens.service';
import { Tokens } from '../../auth.types';

export type TExecuteLoginResult = Tokens;

export class LoginCommand {
  constructor(public securityDevicesCreate: SecurityDevicesCreate) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase
  implements ICommandHandler<LoginCommand, TExecuteLoginResult>
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly tokensService: TokensService,
  ) {}

  async execute({
    securityDevicesCreate: { userId, deviceName, ip },
  }: LoginCommand) {
    const deviceId = uuidv4();
    const currentDate = new Date();
    const iat = currentDate.getTime();
    const expiration = addSeconds(
      currentDate,
      EXPIRATION_TOKEN.REFRESH,
    ).getTime();

    const deviceSession: SecurityDevicesWithoutMethods = {
      iat,
      expiration,
      deviceId,
      userId,
      deviceName,
      ip,
    };

    await this.securityDevicesRepository.create(deviceSession);

    return this.tokensService.getTokens(userId, deviceId, iat, expiration);
  }
}
