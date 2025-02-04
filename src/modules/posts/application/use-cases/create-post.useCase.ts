import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostCreateByBlogIdDto } from '../../posts.dto';
import { PostsPgRepository } from '../../infrastructure/posts.pg-repository';

export type TExecuteCreatePost = { id: string };

export class CreatePostCommand {
  constructor(public newPost: PostCreateByBlogIdDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, TExecuteCreatePost>
{
  constructor(private readonly postsRepository: PostsPgRepository) {}

  async execute({ newPost }: CreatePostCommand): Promise<TExecuteCreatePost> {
    const post = await this.postsRepository.create(newPost);
    return { id: post.id };
  }
}
