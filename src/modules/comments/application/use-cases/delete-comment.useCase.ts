import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ForbiddenDomainException } from '../../../../common/exception/domain-exception';

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
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute({ commentId, userId }: DeleteCommentCommand) {
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);

    if (comment.commentatorInfo.userId !== userId) {
      throw ForbiddenDomainException.create();
    }

    await this.commentsRepository.deleteById(commentId);

    return true;
  }
}
