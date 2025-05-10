import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostCreateByBlogIdDto } from '../../api/posts.dto';
import { PostsOrmRepository } from '../../infrastructure/orm/posts.orm-repository';

export type TExecuteCreatePost = { id: string };

export class CreatePostCommand {
  constructor(public newPost: PostCreateByBlogIdDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, TExecuteCreatePost>
{
  constructor(private readonly postsRepository: PostsOrmRepository) {}

  async execute({ newPost }: CreatePostCommand): Promise<TExecuteCreatePost> {
    const post = await this.postsRepository.create(newPost);
    return { id: post.id };
  }
}
