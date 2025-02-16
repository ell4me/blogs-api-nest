import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { VALIDATION_MESSAGES } from '../../../../constants';
import { PasswordRecoveryDto } from '../../auth.dto';
import { BadRequestDomainException } from '../../../../common/exception/domain-exception';
import { UsersPgRepository } from '../../../users/infrastructure/pg/users.pg-repository';

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
  constructor(private readonly usersRepository: UsersPgRepository) {}

  async execute({
    passwordRecoveryDto: { recoveryCode, newPassword },
  }: UpdateUserPasswordByRecoveryCodeCommand) {
    const user =
      await this.usersRepository.findByPasswordRecoveryCodeOrBadRequestFail(
        recoveryCode,
      );

    if (
      !user.passwordRecoveryExpiration ||
      user.passwordRecoveryExpiration < new Date().getTime()
    ) {
      throw BadRequestDomainException.create(
        VALIDATION_MESSAGES.CODE_EXPIRED('Recovery'),
        'recoveryCode',
      );
    }

    user.updatePasswordRecovery();
    await user.updatePassword(newPassword);
    await this.usersRepository.save(user);
  }
}
