import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogCreateDto } from '../../blogs.dto';
import { BlogCreate } from '../../blogs.types';

export type TExecuteCreateBlog = { id: string };

export class CreateBlogCommand {
  constructor(public blogCreateDto: BlogCreateDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, TExecuteCreateBlog>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute({
    blogCreateDto: { name, websiteUrl, description },
  }: CreateBlogCommand): Promise<TExecuteCreateBlog> {
    const id = new Date().getTime().toString();

    const createdBlog: BlogCreate = {
      id,
      name,
      websiteUrl,
      description,
      isMembership: false,
    };

    await this.blogsRepository.create(createdBlog);

    return { id };
  }
}
