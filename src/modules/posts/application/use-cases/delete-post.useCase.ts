import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsRepository } from '../../infrastructure/posts.repository';

export type TExecuteDeletePost = boolean;

export class DeletePostCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand, TExecuteDeletePost>
{
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute({ id }: DeletePostCommand): Promise<TExecuteDeletePost> {
    return this.postsRepository.deleteOrNotFoundFail(id);
  }
}
