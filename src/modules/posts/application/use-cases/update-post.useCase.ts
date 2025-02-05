import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostUpdateDto } from '../../posts.dto';
import { PostsPgRepository } from '../../infrastructure/posts.pg-repository';

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
  constructor(private readonly postsRepository: PostsPgRepository) {}

  async execute({
    postId,
    blogId,
    postUpdateDto,
  }: UpdatePostByIdCommand): Promise<TExecuteUpdatePostById> {
    const post = await this.postsRepository.findOrNotFoundFail(postId);
    post.updatePost(postUpdateDto, blogId);
    await this.postsRepository.save(post);

    return;
  }
}
