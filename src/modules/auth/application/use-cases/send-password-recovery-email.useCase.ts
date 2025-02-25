import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PasswordRecoveryEmailDto } from '../../auth.dto';
import { EmailAdapter } from '../../../../common/adapters/email/email.adapter';
import { UsersOrmRepository } from '../../../users/infrastructure/orm/users.orm-repository';

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
    private readonly usersRepository: UsersOrmRepository,
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
      .sendEmailRecoveryPassword(email, user.passwordRecoveryCode!)
      .catch(() => {
        this.emailAdapter.sendEmailRecoveryPassword(
          email,
          user.passwordRecoveryCode!,
        );
        console.log('Send email failed');
      });

    return;
  }
}
