import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthConfig } from '../../config/auth.config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authConfig: AuthConfig) {
    super();
  }

  public async validate(username: string, password: string): Promise<boolean> {
    if (
      this.authConfig.login === username &&
      this.authConfig.password === password
    ) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
