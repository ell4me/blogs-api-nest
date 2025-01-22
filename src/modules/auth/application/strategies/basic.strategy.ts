import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable } from '@nestjs/common';

import { AuthConfig } from '../../config/auth.config';
import { UnauthorizedDomainException } from '../../../../common/exception/domain-exception';

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

    throw UnauthorizedDomainException.create();
  }
}
