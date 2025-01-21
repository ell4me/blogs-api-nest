import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { Token } from '../../../users/users.types';

export type TExecuteLoginUserResult = Token;

export class LoginUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase
  implements ICommandHandler<LoginUserCommand, TExecuteLoginUserResult>
{
  constructor(private readonly jwtService: JwtService) {}

  async execute({ userId }: LoginUserCommand) {
    return {
      accessToken: this.jwtService.sign({ userId }),
    };
  }
}
