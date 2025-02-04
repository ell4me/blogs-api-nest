import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsPgRepository } from '../../infrastructure/posts.pg-repository';

export type TExecuteDeletePost = boolean;

export class DeletePostCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand, TExecuteDeletePost>
{
  constructor(private readonly postsRepository: PostsPgRepository) {}

  async execute({ id }: DeletePostCommand): Promise<TExecuteDeletePost> {
    return this.postsRepository.deleteOrNotFoundFail(id);
  }
}
