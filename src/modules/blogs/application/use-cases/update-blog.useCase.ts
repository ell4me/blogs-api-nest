import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogUpdateDto } from '../../blogs.dto';
import { BlogsOrmRepository } from '../../infrastructure/orm/blogs.orm-repository';
import { NotFoundDomainException } from '../../../../common/exception/domain-exception';

export type TExecuteUpdateBlog = boolean;

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public blogUpdateDto: BlogUpdateDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase
  implements ICommandHandler<UpdateBlogCommand, TExecuteUpdateBlog>
{
  constructor(private readonly blogsRepository: BlogsOrmRepository) {}

  async execute({
    id,
    blogUpdateDto,
  }: UpdateBlogCommand): Promise<TExecuteUpdateBlog> {
    const blog = await this.blogsRepository.getById(id);

    if (!blog) {
      throw NotFoundDomainException.create();
    }

    blog.update(blogUpdateDto);

    await this.blogsRepository.save(blog);

    return true;
  }
}
