import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RegistrationConfirmationDto } from '../../auth.dto';
import { VALIDATION_MESSAGES } from '../../../../constants';
import { BadRequestDomainException } from '../../../../common/exception/domain-exception';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';

export type TExecuteRegistrationConfirmationResult = void;

export class RegistrationConfirmationCommand {
  constructor(
    public registrationConfirmationDto: RegistrationConfirmationDto,
  ) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(private readonly usersRepository: UsersPgRepository) {}

  async execute({
    registrationConfirmationDto: { code },
  }: RegistrationConfirmationCommand) {
    const user =
      await this.usersRepository.findByConfirmationCodeOrBadRequestFail(code);

    if (user.isConfirmed) {
      throw BadRequestDomainException.create(
        VALIDATION_MESSAGES.USER_ALREADY_CONFIRMED,
        'code',
      );
    }

    if (
      !user.emailConfirmationExpiration ||
      user.emailConfirmationExpiration < new Date().getTime()
    ) {
      throw BadRequestDomainException.create(
        VALIDATION_MESSAGES.CODE_EXPIRED('Confirmation'),
        'code',
      );
    }

    user.updateEmailConfirmation(false);
    await this.usersRepository.save(user);
  }
}
