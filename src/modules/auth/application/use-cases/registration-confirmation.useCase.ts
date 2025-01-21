import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { RegistrationConfirmationDto } from '../../auth.dto';
import { ValidationErrorViewDto } from '../../../../types';
import { getErrorMessage } from '../../../../common/helpers/getErrorMessage';
import { VALIDATION_MESSAGES } from '../../../../constants';

export type TExecuteRegistrationConfirmationResult =
  ValidationErrorViewDto | void;

export class RegistrationConfirmationCommand {
  constructor(
    public registrationConfirmationDto: RegistrationConfirmationDto,
  ) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements
    ICommandHandler<
      RegistrationConfirmationCommand,
      TExecuteRegistrationConfirmationResult
    >
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    registrationConfirmationDto: { code },
  }: RegistrationConfirmationCommand) {
    const user = await this.usersRepository.getByConfirmationCode(code);

    if (!user) {
      return getErrorMessage(
        'code',
        VALIDATION_MESSAGES.CODE_IS_NOT_CORRECT('Confirmation'),
      );
    }

    if (user.emailConfirmation.isConfirmed) {
      return getErrorMessage(
        'code',
        VALIDATION_MESSAGES.USER_ALREADY_CONFIRMED,
      );
    }

    if (user.emailConfirmation.expiration < new Date().getTime()) {
      return getErrorMessage(
        'code',
        VALIDATION_MESSAGES.CODE_EXPIRED('Confirmation'),
      );
    }

    user.updateEmailConfirmation(false);
    await this.usersRepository.save(user);
  }
}
