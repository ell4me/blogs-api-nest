import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { RegistrationEmailResendingDto } from '../../auth.dto';
import { VALIDATION_MESSAGES } from '../../../../constants';
import { EmailAdapter } from '../../../../common/adapters/email/email.adapter';
import { BadRequestDomainException } from '../../../../common/exception/domain-exception';

export type TExecuteRegistrationEmailResendingResult = void;

export class RegistrationEmailResendingCommand {
  constructor(
    public registrationEmailResendingDto: RegistrationEmailResendingDto,
  ) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements
    ICommandHandler<
      RegistrationEmailResendingCommand,
      TExecuteRegistrationEmailResendingResult
    >
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailAdapter: EmailAdapter,
  ) {}

  async execute({
    registrationEmailResendingDto: { email },
  }: RegistrationEmailResendingCommand) {
    const user = await this.usersRepository.findByEmailOrLogin({ email });

    if (!user) {
      throw BadRequestDomainException.create(
        'email',
        VALIDATION_MESSAGES.USER_IS_NOT_FOUND,
      );
    }

    if (user.emailConfirmation.isConfirmed) {
      throw BadRequestDomainException.create(
        'email',
        VALIDATION_MESSAGES.USER_ALREADY_CONFIRMED,
      );
    }

    user.updateEmailConfirmation(true);
    await this.usersRepository.save(user);

    this.emailAdapter
      .sendEmailConfirmation(user.email, user.emailConfirmation.code)
      .catch(() => console.error('Send email failed'));
  }
}
