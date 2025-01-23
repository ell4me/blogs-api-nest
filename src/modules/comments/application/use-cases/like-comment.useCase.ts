import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentLikeDto } from '../../comments.dto';
import { STATUSES_LIKE, VALIDATION_MESSAGES } from '../../../../constants';
import { BadRequestDomainException } from '../../../../common/exception/domain-exception';

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
    if (!STATUSES_LIKE[likeStatus]) {
      throw BadRequestDomainException.create(
        VALIDATION_MESSAGES.LIKE_STATUS,
        'likeStatus',
      );
    }

    if (currentUserLikeStatus === likeStatus) {
      return false;
    }

    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);

    comment.updateLikeStatus(userId, likeStatus, currentUserLikeStatus);
    await this.commentsRepository.save(comment);

    return true;
  }
}
