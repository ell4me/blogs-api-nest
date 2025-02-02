import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersPgRepository } from '../../infrastructure/users.pg-repository';

export type TExecuteDeleteUserByIdResult = boolean;

export class DeleteUserByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserByIdCommand)
export class DeleteUserByIdUseCase
  implements
    ICommandHandler<DeleteUserByIdCommand, TExecuteDeleteUserByIdResult>
{
  constructor(private readonly usersRepository: UsersPgRepository) {}

  execute({ id }: DeleteUserByIdCommand) {
    return this.usersRepository.deleteOrNotFoundFail(id);
  }
}
