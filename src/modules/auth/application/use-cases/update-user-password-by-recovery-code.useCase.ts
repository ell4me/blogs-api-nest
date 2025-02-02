import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { VALIDATION_MESSAGES } from '../../../../constants';
import { PasswordRecoveryDto } from '../../auth.dto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BadRequestDomainException } from '../../../../common/exception/domain-exception';

export type TExecuteUpdateUserPasswordByRecoveryCodeResult = void;

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
      await this.usersRepository.findByPasswordRecoveryCodeOrBadRequestFail(
        recoveryCode,
      );

    if (
      !user.passwordRecovery?.expiration ||
      user.passwordRecovery.expiration < new Date().getTime()
    ) {
      throw BadRequestDomainException.create(
        VALIDATION_MESSAGES.CODE_EXPIRED('Recovery'),
        'recoveryCode',
      );
    }

    user.updatePasswordRecovery();
    user.updatePassword(newPassword);
    await this.usersRepository.save(user);
  }
}
