import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ENV_NAMES } from '../../../env';
import { AccessTokenPayload, UserRequest } from '../../../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(ENV_NAMES.JWT_SECRET),
    });
  }

  async validate({ userId }: AccessTokenPayload): Promise<UserRequest> {
    return { id: userId };
  }
}
