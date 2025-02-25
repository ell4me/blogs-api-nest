import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersOrmRepository } from '../../infrastructure/orm/users.orm-repository';

export type TExecuteDeleteUserByIdResult = boolean;

export class DeleteUserByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserByIdCommand)
export class DeleteUserByIdUseCase
  implements
    ICommandHandler<DeleteUserByIdCommand, TExecuteDeleteUserByIdResult>
{
  constructor(private readonly usersRepository: UsersOrmRepository) {}

  execute({ id }: DeleteUserByIdCommand) {
    return this.usersRepository.deleteOrNotFoundFail(id);
  }
}
