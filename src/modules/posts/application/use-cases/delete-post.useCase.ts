import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsOrmRepository } from '../../infrastructure/orm/posts.orm-repository';
import { LikesPostOrmRepository } from '../../../likes-post/infrastructure/orm/likes-post.orm-repository';

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
  constructor(
    private readonly postsRepository: PostsOrmRepository,
    private readonly likesPostOrmRepository: LikesPostOrmRepository,
  ) {}

  async execute({
    postId,
    blogId,
  }: DeletePostCommand): Promise<TExecuteDeletePost> {
    await this.likesPostOrmRepository.deleteAll(postId);
    return this.postsRepository.deleteOrNotFoundFail(postId, blogId);
  }
}
