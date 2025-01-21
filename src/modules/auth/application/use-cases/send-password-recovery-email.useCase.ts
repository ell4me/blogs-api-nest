import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PasswordRecoveryEmailDto } from '../../auth.dto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailAdapter } from '../../../../common/adapters/email/email.adapter';

export type TExecuteSendPasswordRecoveryEmailResult = void;

export class SendPasswordRecoveryEmailCommand {
  constructor(public passwordRecoveryEmailDto: PasswordRecoveryEmailDto) {}
}

@CommandHandler(SendPasswordRecoveryEmailCommand)
export class SendPasswordRecoveryEmailUseCase
  implements
    ICommandHandler<
      SendPasswordRecoveryEmailCommand,
      TExecuteSendPasswordRecoveryEmailResult
    >
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailAdapter: EmailAdapter,
  ) {}

  async execute({
    passwordRecoveryEmailDto: { email },
  }: SendPasswordRecoveryEmailCommand) {
    const user = await this.usersRepository.findByEmailOrLogin({ email });

    if (!user) {
      return;
    }

    user.updatePasswordRecovery(true);
    await this.usersRepository.save(user);

    this.emailAdapter
      .sendEmailRecoveryPassword(email, user.passwordRecovery!.code)
      .catch(() => console.log('Send email failed'));

    return;
  }
}
