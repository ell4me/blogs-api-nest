import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsOrmRepository } from '../../infrastructure/orm/blogs.orm-repository';
import { PostsOrmRepository } from '../../../posts/infrastructure/orm/posts.orm-repository';
import { LikesPostOrmRepository } from '../../../likes-post/infrastructure/orm/likes-post.orm-repository';

export type TExecuteDeleteBlog = boolean;

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase
  implements ICommandHandler<DeleteBlogCommand, TExecuteDeleteBlog>
{
  constructor(
    private readonly postsRepository: PostsOrmRepository,
    private readonly blogsRepository: BlogsOrmRepository,
    private readonly likesPostOrmRepository: LikesPostOrmRepository,
  ) {}

  async execute({ id }: DeleteBlogCommand): Promise<TExecuteDeleteBlog> {
    await this.likesPostOrmRepository.deleteAll();
    await this.postsRepository.deleteAllByBlogId(id);
    await this.blogsRepository.deleteOrNotFoundFail(id);

    return true;
  }
}
