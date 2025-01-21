import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { UserRequest } from '../../../../types';
import {
  TExecuteValidateCorrectUserResult,
  ValidateCorrectUserCommand,
} from '../use-cases/validate-correct-user';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<UserRequest> {
    const userId = await this.commandBus.execute<
      ValidateCorrectUserCommand,
      TExecuteValidateCorrectUserResult
    >(new ValidateCorrectUserCommand({ loginOrEmail, password }));

    if (!userId) {
      throw new UnauthorizedException();
    }

    return { id: userId };
  }
}
