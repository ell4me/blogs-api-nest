import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserCreateDto } from '../../users.dto';
import { VALIDATION_MESSAGES } from '../../../../constants';
import { EmailAdapter } from '../../../../common/adapters/email/email.adapter';
import { BadRequestDomainException } from '../../../../common/exception/domain-exception';
import { UsersPgRepository } from '../../infrastructure/users.pg-repository';
import { UserEntity } from '../../infrastructure/users.entity';

export type TExecuteCreateUserResult = { id: string };

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
    private readonly usersRepository: UsersPgRepository,
    private readonly emailAdapter: EmailAdapter,
  ) {}

  async execute({ userCreateDto, emailConfirmation }: CreateUserCommand) {
    const user = await this.usersRepository.findByEmailOrLogin({
      email: userCreateDto.email,
      login: userCreateDto.login,
    });

    if (user) {
      const error = this.throwErrorDuplicateEmailOrLogin(
        user,
        userCreateDto.email,
      );

      throw BadRequestDomainException.create(error.message, error.field);
    }

    const createdUser = await this.usersRepository.create(
      userCreateDto,
      emailConfirmation,
    );

    if (emailConfirmation) {
      this.emailAdapter
        .sendEmailConfirmation(
          createdUser.email,
          createdUser.emailConfirmationCode,
        )
        .catch(() => {
          this.emailAdapter.sendEmailConfirmation(
            createdUser.email,
            createdUser.emailConfirmationCode,
          );
          console.error('Send email failed');
        });
    }

    return { id: createdUser.id };
  }

  private throwErrorDuplicateEmailOrLogin(
    user: UserEntity,
    currentEmail: string,
  ) {
    if (currentEmail === user.email) {
      return {
        field: 'email',
        message: VALIDATION_MESSAGES.FIELD_IS_EXIST('email'),
      };
    }

    return {
      field: 'login',
      message: VALIDATION_MESSAGES.FIELD_IS_EXIST('login'),
    };
  }
}
