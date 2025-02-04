import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsPgRepository } from '../../infrastructure/blogs.pg-repository';
import { PostsPgRepository } from '../../../posts/infrastructure/posts.pg-repository';

export type TExecuteDeleteBlog = boolean;

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase
  implements ICommandHandler<DeleteBlogCommand, TExecuteDeleteBlog>
{
  constructor(
    private readonly postsRepository: PostsPgRepository,
    private readonly blogsRepository: BlogsPgRepository,
  ) {}

  async execute({ id }: DeleteBlogCommand): Promise<TExecuteDeleteBlog> {
    await this.postsRepository.deleteAllByBlogId(id);
    await this.blogsRepository.deleteOrNotFoundFail(id);

    return true;
  }
}
