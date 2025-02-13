import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentCreateDto } from '../../comments.dto';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import { CommentsPgRepository } from '../../infrastructure/comments.pg-repository';

export type TExecuteCreateComment = { id: string };

export class CreateCommentCommand {
  constructor(
    public commentCreateDto: CommentCreateDto,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, TExecuteCreateComment>
{
  constructor(
    private readonly commentsRepository: CommentsPgRepository,
    private readonly usersRepository: UsersPgRepository,
  ) {}

  async execute({
    commentCreateDto,
    userId,
    postId,
  }: CreateCommentCommand): Promise<TExecuteCreateComment> {
    await this.usersRepository.findOrNotFoundFail(userId);
    return this.commentsRepository.create(commentCreateDto, postId, userId);
  }
}
