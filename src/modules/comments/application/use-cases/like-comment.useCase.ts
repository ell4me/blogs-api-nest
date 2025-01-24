import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentLikeDto } from '../../comments.dto';
import { STATUSES_LIKE } from '../../../../constants';

export type TExecuteLikeComment = boolean;

export class LikeCommentCommand {
  constructor(
    public currentUserLikeStatus: STATUSES_LIKE,
    public commentId: string,
    public userId: string,
    public commentLikeDto: CommentLikeDto,
  ) {}
}

@CommandHandler(LikeCommentCommand)
export class LikeCommentUseCase
  implements ICommandHandler<LikeCommentCommand, TExecuteLikeComment>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute({
    currentUserLikeStatus,
    commentId,
    userId,
    commentLikeDto: { likeStatus },
  }: LikeCommentCommand): Promise<TExecuteLikeComment> {
    if (currentUserLikeStatus === likeStatus) {
      return false;
    }

    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);

    comment.updateLikeStatus(userId, likeStatus, currentUserLikeStatus);
    await this.commentsRepository.save(comment);

    return true;
  }
}
