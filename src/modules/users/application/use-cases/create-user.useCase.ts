import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserCreateDto } from '../../users.dto';
import { UserDocument } from '../../infrastructure/users.model';
import { ValidationErrorViewDto } from '../../../../types';
import { UsersRepository } from '../../infrastructure/users.repository';
import { VALIDATION_MESSAGES } from '../../../../constants';
import { EmailAdapter } from '../../../../common/adapters/email/email.adapter';
import { getErrorMessage } from '../../../../common/helpers/getErrorMessage';

export type TExecuteCreateUserResult = { id: string } | ValidationErrorViewDto;

export class CreateUserCommand {
  constructor(
    public userCreateDto: UserCreateDto,
    public emailConfirmation?: boolean,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserCommand, TExecuteCreateUserResult>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailAdapter: EmailAdapter,
  ) {}

  async execute({ userCreateDto, emailConfirmation }: CreateUserCommand) {
    const user = await this.usersRepository.findByEmailOrLogin({
      email: userCreateDto.email,
      login: userCreateDto.login,
    });

    if (user) {
      return this.throwErrorDuplicateEmailOrLogin(user, userCreateDto.email);
    }

    const createdUser = await this.usersRepository.create(
      userCreateDto,
      emailConfirmation,
    );

    if (emailConfirmation) {
      this.emailAdapter
        .sendEmailConfirmation(
          createdUser.email,
          createdUser.emailConfirmation.code,
        )
        .catch(() => console.log('Send email failed'));
    }

    return { id: createdUser.id };
  }

  private throwErrorDuplicateEmailOrLogin(
    user: UserDocument,
    currentEmail: string,
  ) {
    if (currentEmail === user.email) {
      return getErrorMessage(
        'email',
        VALIDATION_MESSAGES.FIELD_IS_EXIST('email'),
      );
    }

    return getErrorMessage(
      'login',
      VALIDATION_MESSAGES.FIELD_IS_EXIST('login'),
    );
  }
}
