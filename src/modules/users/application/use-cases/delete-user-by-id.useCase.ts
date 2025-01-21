import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersRepository } from '../../infrastructure/users.repository';

export type TExecuteDeleteUserByIdResult = boolean;

export class DeleteUserByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserByIdCommand)
export class DeleteUserByIdUseCase
  implements
    ICommandHandler<DeleteUserByIdCommand, TExecuteDeleteUserByIdResult>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  execute({ id }: DeleteUserByIdCommand) {
    return this.usersRepository.deleteById(id);
  }
}
