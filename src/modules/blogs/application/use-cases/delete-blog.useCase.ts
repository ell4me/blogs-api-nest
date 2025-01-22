import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export type TExecuteDeleteBlog = boolean;

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase
  implements ICommandHandler<DeleteBlogCommand, TExecuteDeleteBlog>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute({ id }: DeleteBlogCommand): Promise<TExecuteDeleteBlog> {
    const isDeleted = await this.blogsRepository.deleteOrNotFoundFail(id);

    if (isDeleted) {
      await this.postsRepository.deleteAllByBlogId(id);
    }

    return isDeleted;
  }
}
