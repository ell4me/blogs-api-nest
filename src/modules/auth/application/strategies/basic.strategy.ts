import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ENV_NAMES } from '../../../../env';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  public async validate(username: string, password: string): Promise<boolean> {
    if (
      this.configService.get<string>(ENV_NAMES.LOGIN) === username &&
      this.configService.get<string>(ENV_NAMES.PASSWORD) === password
    ) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
