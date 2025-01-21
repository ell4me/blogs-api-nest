import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogUpdateDto } from '../../blogs.dto';

export type TExecuteUpdateBlog = boolean;

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public updatedBlog: BlogUpdateDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase
  implements ICommandHandler<UpdateBlogCommand, TExecuteUpdateBlog>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute({
    id,
    updatedBlog,
  }: UpdateBlogCommand): Promise<TExecuteUpdateBlog> {
    const blog = await this.blogsRepository.updateById(id, updatedBlog);

    if (!blog) {
      return !!blog;
    }

    if (blog.name !== updatedBlog.name) {
      await this.postsRepository.updateByBlogId(id, updatedBlog.name);
    }

    return !!blog;
  }
}
