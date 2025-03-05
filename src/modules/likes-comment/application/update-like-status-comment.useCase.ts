import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { STATUSES_LIKE } from '../../../constants';
import { CommentLikeDto } from '../../comments/comments.dto';
import { LikesCommentOrmRepository } from '../infrastructure/orm/likes-comment.orm-repository';

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
    private readonly likesCommentRepository: LikesCommentOrmRepository,
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

    const likeComment = await this.likesCommentRepository.findOne(
      commentId,
      userId,
    );

    if (!likeComment) {
      await this.likesCommentRepository.create({
        status: likeStatus,
        commentId,
        userId,
      });
      return;
    }

    if (likeStatus === STATUSES_LIKE.NONE) {
      await this.likesCommentRepository.deleteOne(commentId, userId);
      return;
    }

    likeComment.updateStatus(likeStatus);
    await this.likesCommentRepository.save(likeComment);

    return;
  }
}
