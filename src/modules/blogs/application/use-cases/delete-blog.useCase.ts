import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsPgRepository } from '../../../posts/infrastructure/pg/posts.pg-repository';
import { BlogsOrmRepository } from '../../infrastructure/orm/blogs.orm-repository';

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
    private readonly blogsRepository: BlogsOrmRepository,
  ) {}

  async execute({ id }: DeleteBlogCommand): Promise<TExecuteDeleteBlog> {
    await this.postsRepository.deleteAllByBlogId(id);
    await this.blogsRepository.deleteOrNotFoundFail(id);

    return true;
  }
}
