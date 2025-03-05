import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ForbiddenDomainException } from '../../../../common/exception/domain-exception';
import { CommentsOrmRepository } from '../../infrastructure/orm/comments.orm-repository';
import { LikesCommentOrmRepository } from '../../../likes-comment/infrastructure/orm/likes-comment.orm-repository';

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
    private readonly commentsRepository: CommentsOrmRepository,
    private readonly likesCommentPgRepository: LikesCommentOrmRepository,
  ) {}

  async execute({ commentId, userId }: DeleteCommentCommand) {
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);

    if (comment.commentatorId !== userId) {
      throw ForbiddenDomainException.create();
    }

    await this.likesCommentPgRepository.deleteByCommentId(commentId);
    await this.commentsRepository.deleteById(commentId);

    return true;
  }
}
