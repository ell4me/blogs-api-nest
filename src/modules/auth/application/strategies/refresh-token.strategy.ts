import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { RefreshTokenPayload, UserRequest } from '../../../../types';
import { AuthConfig } from '../../config/auth.config';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { UnauthorizedDomainException } from '../../../../common/exception/domain-exception';
import { REFRESH_TOKEN_COOKIE_NAME } from '../../../../constants';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors<Request>([
        (req) => req.cookies[REFRESH_TOKEN_COOKIE_NAME],
      ]),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwtRefreshSecret,
    });
  }

  async validate({
    userId,
    deviceId,
  }: RefreshTokenPayload): Promise<UserRequest> {
    const currentDeviceSession =
      await this.securityDevicesRepository.getDeviceSession(deviceId);

    if (!currentDeviceSession || currentDeviceSession.expiration < Date.now()) {
      throw UnauthorizedDomainException.create();
    }

    return { id: userId, deviceId };
  }
}
