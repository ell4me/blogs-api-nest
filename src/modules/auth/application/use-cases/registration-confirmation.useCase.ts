import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { RegistrationConfirmationDto } from '../../auth.dto';
import { VALIDATION_MESSAGES } from '../../../../constants';
import { BadRequestDomainException } from '../../../../common/exception/domain-exception';

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
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    registrationConfirmationDto: { code },
  }: RegistrationConfirmationCommand) {
    const user =
      await this.usersRepository.getByConfirmationCodeOrBadRequestFail(code);

    if (user.emailConfirmation.isConfirmed) {
      throw BadRequestDomainException.create(
        'code',
        VALIDATION_MESSAGES.USER_ALREADY_CONFIRMED,
      );
    }

    if (user.emailConfirmation.expiration < new Date().getTime()) {
      throw BadRequestDomainException.create(
        'code',
        VALIDATION_MESSAGES.CODE_EXPIRED('Confirmation'),
      );
    }

    user.updateEmailConfirmation(false);
    await this.usersRepository.save(user);
  }
}
