import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { addSeconds } from 'date-fns/addSeconds';

import {
  SecurityDevicesUpdate,
  UpdateDeviceSession,
} from '../../../security-devices/security-devices.types';
import { EXPIRATION_TOKEN } from '../../../../constants';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import {
  ForbiddenDomainException,
  UnauthorizedDomainException,
} from '../../../../common/exception/domain-exception';
import { Tokens } from '../../auth.types';
import { TokensService } from '../tokens.service';

export type TExecuteRefreshTokenResult = Tokens;

export class RefreshTokenCommand {
  constructor(
    public deviceId: string,
    public securityDevicesUpdate: SecurityDevicesUpdate,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand, TExecuteRefreshTokenResult>
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly tokensService: TokensService,
  ) {}

  async execute({
    deviceId,
    securityDevicesUpdate: { userId, deviceName, ip },
  }: RefreshTokenCommand) {
    const session =
      await this.securityDevicesRepository.getDeviceSession(deviceId);

    if (!session) {
      throw UnauthorizedDomainException.create();
    }

    if (session.userId !== userId) {
      throw ForbiddenDomainException.create();
    }

    const currentDate = new Date();
    const expiration = addSeconds(
      currentDate,
      EXPIRATION_TOKEN.REFRESH,
    ).getTime();

    const updateDeviceSession: UpdateDeviceSession = {
      iat: currentDate.getTime(),
      expiration,
      deviceName,
      ip,
    };

    session.updateSession(updateDeviceSession);
    await this.securityDevicesRepository.save(session);

    return this.tokensService.getTokens(userId, deviceId);
  }
}
