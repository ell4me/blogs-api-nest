import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikesPostUpdateDto } from '../../likesPost.dto';
import { LikesPostRepository } from '../../infrastructure/likesPost.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export type TExecuteUpdateLikeStatusPost = void;

export class UpdateLikeStatusPostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likesPostUpdateDto: LikesPostUpdateDto,
  ) {}
}

@CommandHandler(UpdateLikeStatusPostCommand)
export class UpdateLikeStatusPostUseCase
  implements
    ICommandHandler<UpdateLikeStatusPostCommand, TExecuteUpdateLikeStatusPost>
{
  constructor(
    private readonly likesPostRepository: LikesPostRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute({
    postId,
    likesPostUpdateDto: { likeStatus },
    userId,
  }: UpdateLikeStatusPostCommand): Promise<TExecuteUpdateLikeStatusPost> {
    const user = await this.usersRepository.findOrUnauthorizedFail(userId);
    const like = await this.likesPostRepository.getLikePost(userId, postId);

    if (like) {
      like.updateStatus(likeStatus);

      if (like.getIsDelete()) {
        await this.likesPostRepository.delete(like.id);
        return;
      }

      await this.likesPostRepository.save(like);
      return;
    }

    await this.likesPostRepository.create(postId, likeStatus, {
      id: userId,
      login: user.login,
    });

    return;
  }
}
