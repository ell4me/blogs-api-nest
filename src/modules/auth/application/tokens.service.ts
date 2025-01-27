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

  getTokens(
    userId: string,
    deviceId: string,
    iat: number,
    exp: number,
  ): Tokens {
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
          iat,
          exp,
        },
        {
          secret: this.authConfig.jwtRefreshSecret,
        },
      ),
    };
  }
}
