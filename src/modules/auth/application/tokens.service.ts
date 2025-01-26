import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthConfig } from '../config/auth.config';
import { Tokens } from '../auth.types';
import { EXPIRATION_TOKEN } from '../../../constants';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authConfig: AuthConfig,
  ) {}

  getTokens(userId: string, deviceId: string): Tokens {
    return {
      accessToken: this.jwtService.sign(
        { userId },
        {
          expiresIn: EXPIRATION_TOKEN.ACCESS,
          secret: this.authConfig.jwtSecret,
        },
      ),
      refreshToken: this.jwtService.sign(
        {
          deviceId,
          userId,
        },
        {
          expiresIn: EXPIRATION_TOKEN.REFRESH,
          secret: this.authConfig.jwtRefreshSecret,
        },
      ),
    };
  }
}
