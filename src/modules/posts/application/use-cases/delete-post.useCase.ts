import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsPgRepository } from '../../infrastructure/pg/posts.pg-repository';

export type TExecuteDeletePost = void;

export class DeletePostCommand {
  constructor(
    public postId: string,
    public blogId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand, TExecuteDeletePost>
{
  constructor(private readonly postsRepository: PostsPgRepository) {}

  async execute({
    postId,
    blogId,
  }: DeletePostCommand): Promise<TExecuteDeletePost> {
    return this.postsRepository.deleteOrNotFoundFail(postId, blogId);
  }
}
