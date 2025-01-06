import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { UserRequest } from '../../../types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<UserRequest> {
    const userId = await this.authService.validateUser({
      loginOrEmail,
      password,
    });

    if (!userId) {
      throw new UnauthorizedException();
    }

    return { id: userId };
  }
}
