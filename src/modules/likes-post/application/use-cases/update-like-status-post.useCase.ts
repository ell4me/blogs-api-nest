import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikesPostUpdateDto } from '../../likes-post.dto';
import { STATUSES_LIKE } from '../../../../constants';
import { LikesPostOrmRepository } from '../../infrastructure/orm/likes-post.orm-repository';

export type TExecuteUpdateLikeStatusPost = void;

export class UpdateLikeStatusPostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likesPostUpdateDto: LikesPostUpdateDto,
    public currentUserLikeStatus: STATUSES_LIKE,
  ) {}
}

@CommandHandler(UpdateLikeStatusPostCommand)
export class UpdateLikeStatusPostUseCase
  implements
    ICommandHandler<UpdateLikeStatusPostCommand, TExecuteUpdateLikeStatusPost>
{
  constructor(private readonly likesPostRepository: LikesPostOrmRepository) {}

  async execute({
    postId,
    likesPostUpdateDto: { likeStatus },
    userId,
    currentUserLikeStatus,
  }: UpdateLikeStatusPostCommand): Promise<TExecuteUpdateLikeStatusPost> {
    if (currentUserLikeStatus === likeStatus) {
      return;
    }

    const likePost = await this.likesPostRepository.findOne(postId, userId);

    if (!likePost) {
      await this.likesPostRepository.create({
        userId,
        postId,
        status: likeStatus,
      });
      return;
    }

    if (likeStatus === STATUSES_LIKE.NONE) {
      await this.likesPostRepository.deleteOne(postId, userId);
      return;
    }

    likePost.updateStatus(likeStatus);
    await this.likesPostRepository.save(likePost);

    return;
  }
}
