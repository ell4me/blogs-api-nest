import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { RefreshTokenPayload, UserRequest } from '../../../../types';
import { AuthConfig } from '../../config/auth.config';
import { UnauthorizedDomainException } from '../../../../common/exception/domain-exception';
import {
  EXPIRATION_TOKEN,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../../../../constants';
import { SecurityDevicesOrmRepository } from '../../../security-devices/infrastructure/orm/security-devices.orm-repository';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly securityDevicesRepository: SecurityDevicesOrmRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors<Request>([
        (req) => req.cookies[REFRESH_TOKEN_COOKIE_NAME],
      ]),
      ignoreExpiration: true,
      secretOrKey: authConfig.jwtRefreshSecret,
    });
  }

  async validate({
    userId,
    deviceId,
    exp,
    iat,
  }: RefreshTokenPayload): Promise<UserRequest> {
    const currentDeviceSession =
      await this.securityDevicesRepository.getDeviceSession(deviceId);
    const expirationTime = (exp - iat) / 1000;

    if (
      !currentDeviceSession ||
      iat !== Number(currentDeviceSession.iat) ||
      exp < Date.now() ||
      expirationTime !== EXPIRATION_TOKEN.REFRESH
    ) {
      throw UnauthorizedDomainException.create();
    }

    return { id: userId, deviceId };
  }
}
