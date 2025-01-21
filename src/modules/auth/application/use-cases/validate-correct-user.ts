import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { compare } from 'bcryptjs';

import { AuthLoginDto } from '../../auth.dto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export type TExecuteValidateCorrectUserResult = string | void;

export class ValidateCorrectUserCommand {
  constructor(public authLoginDto: AuthLoginDto) {}
}

@CommandHandler(ValidateCorrectUserCommand)
export class ValidateCorrectUserUseCase
  implements
    ICommandHandler<
      ValidateCorrectUserCommand,
      TExecuteValidateCorrectUserResult
    >
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    authLoginDto: { loginOrEmail, password },
  }: ValidateCorrectUserCommand) {
    const user = await this.usersRepository.findByEmailOrLogin({
      email: loginOrEmail,
      login: loginOrEmail,
    });

    if (!user) {
      return;
    }

    const isCorrectPassword = await compare(password, user.password);

    if (!isCorrectPassword) {
      return;
    }

    return user.id;
  }
}
