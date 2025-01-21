import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ValidationErrorViewDto } from '../../../../types';
import { getErrorMessage } from '../../../../common/helpers/getErrorMessage';
import { VALIDATION_MESSAGES } from '../../../../constants';
import { PasswordRecoveryDto } from '../../auth.dto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export type TExecuteUpdateUserPasswordByRecoveryCodeResult =
  | ValidationErrorViewDto
  | {
      result: boolean;
    };

export class UpdateUserPasswordByRecoveryCodeCommand {
  constructor(public passwordRecoveryDto: PasswordRecoveryDto) {}
}

@CommandHandler(UpdateUserPasswordByRecoveryCodeCommand)
export class UpdateUserPasswordByRecoveryCodeUseCase
  implements
    ICommandHandler<
      UpdateUserPasswordByRecoveryCodeCommand,
      TExecuteUpdateUserPasswordByRecoveryCodeResult
    >
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    passwordRecoveryDto: { recoveryCode, newPassword },
  }: UpdateUserPasswordByRecoveryCodeCommand) {
    const user =
      await this.usersRepository.getUserByPasswordRecoveryCode(recoveryCode);

    if (!user) {
      return getErrorMessage(
        'recoveryCode',
        VALIDATION_MESSAGES.CODE_IS_NOT_CORRECT('Recovery'),
      );
    }

    if (
      !user.passwordRecovery?.expiration ||
      user.passwordRecovery.expiration < new Date().getTime()
    ) {
      return getErrorMessage(
        'recoveryCode',
        VALIDATION_MESSAGES.CODE_EXPIRED('Recovery'),
      );
    }

    user.updatePasswordRecovery();
    user.updatePassword(newPassword);
    await this.usersRepository.save(user);

    return { result: true };
  }
}
