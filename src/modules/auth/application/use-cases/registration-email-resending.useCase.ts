import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RegistrationEmailResendingDto } from '../../auth.dto';
import { VALIDATION_MESSAGES } from '../../../../constants';
import { EmailAdapter } from '../../../../common/adapters/email/email.adapter';
import { BadRequestDomainException } from '../../../../common/exception/domain-exception';
import { UsersPgRepository } from '../../../users/infrastructure/pg/users.pg-repository';

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
    private readonly usersRepository: UsersPgRepository,
    private readonly emailAdapter: EmailAdapter,
  ) {}

  async execute({
    registrationEmailResendingDto: { email },
  }: RegistrationEmailResendingCommand) {
    const user = await this.usersRepository.findByEmailOrLogin({ email });

    if (!user) {
      throw BadRequestDomainException.create(
        VALIDATION_MESSAGES.USER_IS_NOT_FOUND,
        'email',
      );
    }

    if (user.isConfirmed) {
      throw BadRequestDomainException.create(
        VALIDATION_MESSAGES.USER_ALREADY_CONFIRMED,
        'email',
      );
    }

    user.updateEmailConfirmation(true);
    await this.usersRepository.save(user);

    this.emailAdapter
      .sendEmailConfirmation(user.email, user.emailConfirmationCode)
      .catch(() => {
        this.emailAdapter.sendEmailConfirmation(
          user.email,
          user.emailConfirmationCode,
        );
        console.error('Send email failed');
      });
  }
}
