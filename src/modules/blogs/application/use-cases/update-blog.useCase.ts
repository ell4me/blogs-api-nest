import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogUpdateDto } from '../../blogs.dto';
import { BlogsPgRepository } from '../../infrastructure/pg/blogs.pg-repository';

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
  constructor(private readonly blogsRepository: BlogsPgRepository) {}

  async execute({
    id,
    blogUpdateDto,
  }: UpdateBlogCommand): Promise<TExecuteUpdateBlog> {
    await this.blogsRepository.updateOrNotFoundFail(id, blogUpdateDto);

    return true;
  }
}
