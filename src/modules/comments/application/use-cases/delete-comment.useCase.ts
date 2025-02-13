import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ForbiddenDomainException } from '../../../../common/exception/domain-exception';
import { CommentsPgRepository } from '../../infrastructure/comments.pg-repository';
import { LikesCommentPgRepository } from '../../../likes-comment/infrastructure/likes-comment.pg-repository';

export type TExecuteDeleteComment = boolean;

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand, TExecuteDeleteComment>
{
  constructor(
    private readonly commentsRepository: CommentsPgRepository,
    private readonly likesCommentPgRepository: LikesCommentPgRepository,
  ) {}

  async execute({ commentId, userId }: DeleteCommentCommand) {
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);

    if (comment.commentatorId !== userId) {
      throw ForbiddenDomainException.create();
    }

    await this.likesCommentPgRepository.deleteByCommentId(commentId, userId);
    await this.commentsRepository.deleteById(commentId);

    return true;
  }
}
