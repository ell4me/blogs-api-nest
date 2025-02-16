import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikesPostUpdateDto } from '../../likes-post.dto';
import { LikesPostPgRepository } from '../../infrastructure/pg/likes-post.pg-repository';
import { STATUSES_LIKE } from '../../../../constants';

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
  constructor(private readonly likesPostRepository: LikesPostPgRepository) {}

  async execute({
    postId,
    likesPostUpdateDto: { likeStatus },
    userId,
    currentUserLikeStatus,
  }: UpdateLikeStatusPostCommand): Promise<TExecuteUpdateLikeStatusPost> {
    if (currentUserLikeStatus === likeStatus) {
      return;
    }

    console.log(currentUserLikeStatus, 'currentUserLikeStatus');
    console.log(likeStatus, 'likeStatus');

    if (
      currentUserLikeStatus === STATUSES_LIKE.NONE &&
      likeStatus !== STATUSES_LIKE.NONE
    ) {
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

    await this.likesPostRepository.update({
      status: likeStatus,
      postId,
      userId,
    });

    return;
  }
}
