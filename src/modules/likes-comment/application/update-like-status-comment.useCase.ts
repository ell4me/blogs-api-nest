import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { STATUSES_LIKE } from '../../../constants';
import { CommentLikeDto } from '../../comments/comments.dto';
import { LikesCommentPgRepository } from '../infrastructure/likes-comment.pg-repository';

export type TExecuteUpdateLikeStatusComment = void;

export class UpdateLikeStatusCommentCommand {
  constructor(
    public currentUserLikeStatus: STATUSES_LIKE,
    public commentId: string,
    public userId: string,
    public commentLikeDto: CommentLikeDto,
  ) {}
}

@CommandHandler(UpdateLikeStatusCommentCommand)
export class UpdateLikeStatusCommentUseCase
  implements
    ICommandHandler<
      UpdateLikeStatusCommentCommand,
      TExecuteUpdateLikeStatusComment
    >
{
  constructor(
    private readonly likesCommentPgRepository: LikesCommentPgRepository,
  ) {}

  async execute({
    currentUserLikeStatus,
    commentId,
    userId,
    commentLikeDto: { likeStatus },
  }: UpdateLikeStatusCommentCommand): Promise<TExecuteUpdateLikeStatusComment> {
    if (currentUserLikeStatus === likeStatus) {
      return;
    }

    if (
      currentUserLikeStatus === STATUSES_LIKE.NONE &&
      likeStatus !== STATUSES_LIKE.NONE
    ) {
      await this.likesCommentPgRepository.create({
        status: likeStatus,
        commentId,
        userId,
      });
      return;
    }

    if (likeStatus === STATUSES_LIKE.NONE) {
      await this.likesCommentPgRepository.deleteByCommentId(commentId, userId);
      return;
    }

    await this.likesCommentPgRepository.updateStatus({
      status: likeStatus,
      commentId,
      userId,
    });
    return;
  }
}
