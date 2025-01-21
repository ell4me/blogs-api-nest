import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostCreateByBlogIdDto } from '../../posts.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';

export type TExecuteCreatePost = { id: string };

export class CreatePostCommand {
  constructor(
    public newPost: PostCreateByBlogIdDto,
    public blogName: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, TExecuteCreatePost>
{
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute({
    newPost,
    blogName,
  }: CreatePostCommand): Promise<TExecuteCreatePost> {
    const post = await this.postsRepository.create(newPost, blogName);
    return { id: post.id };
  }
}
