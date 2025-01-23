import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentUpdateDto } from '../../comments.dto';
import { ForbiddenDomainException } from '../../../../common/exception/domain-exception';

export type TExecuteUpdateComment = boolean;

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public commentUpdateDto: CommentUpdateDto,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand, TExecuteUpdateComment>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute({
    commentId,
    commentUpdateDto,
    userId,
  }: UpdateCommentCommand): Promise<TExecuteUpdateComment> {
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);

    if (comment.commentatorInfo.userId !== userId) {
      throw ForbiddenDomainException.create();
    }

    comment.updateComment(commentUpdateDto);
    await this.commentsRepository.save(comment);

    return true;
  }
}
