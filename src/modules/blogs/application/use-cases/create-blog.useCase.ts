import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogCreateDto } from '../../blogs.dto';
import { BlogsOrmRepository } from '../../infrastructure/orm/blogs.orm-repository';

export type TExecuteCreateBlog = { id: string };

export class CreateBlogCommand {
  constructor(public blogCreateDto: BlogCreateDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, TExecuteCreateBlog>
{
  constructor(private readonly blogsRepository: BlogsOrmRepository) {}

  async execute({
    blogCreateDto,
  }: CreateBlogCommand): Promise<TExecuteCreateBlog> {
    const { id } = await this.blogsRepository.create(blogCreateDto);

    return { id };
  }
}
