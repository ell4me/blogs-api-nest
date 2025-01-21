import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostUpdateDto } from '../../posts.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';

export type TExecuteUpdatePostById = boolean;

export class UpdatePostByIdCommand {
  constructor(
    public id: string,
    public updatedPost: PostUpdateDto,
  ) {}
}

@CommandHandler(UpdatePostByIdCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostByIdCommand, TExecuteUpdatePostById>
{
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute({
    id,
    updatedPost,
  }: UpdatePostByIdCommand): Promise<TExecuteUpdatePostById> {
    const post = await this.postsRepository.getById(id);
    if (!post) {
      return false;
    }

    post.updatePost(updatedPost);
    await this.postsRepository.save(post);

    return true;
  }
}
