import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostUpdateDto } from '../../api/posts.dto';
import { PostsOrmRepository } from '../../infrastructure/orm/posts.orm-repository';

export type TExecuteUpdatePostById = void;

export class UpdatePostByIdCommand {
  constructor(
    public postId: string,
    public blogId: string,
    public postUpdateDto: PostUpdateDto,
  ) {}
}

@CommandHandler(UpdatePostByIdCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostByIdCommand, TExecuteUpdatePostById>
{
  constructor(private readonly postsRepository: PostsOrmRepository) {}

  async execute({
    postId,
    blogId,
    postUpdateDto,
  }: UpdatePostByIdCommand): Promise<TExecuteUpdatePostById> {
    const post = await this.postsRepository.findOrNotFoundFail(postId, blogId);
    post.updatePost(postUpdateDto);
    await this.postsRepository.save(post);

    return;
  }
}
