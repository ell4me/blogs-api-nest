import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentCreateDto } from '../../comments.dto';
import { CommentsOrmRepository } from '../../infrastructure/orm/comments.orm-repository';
import { UsersOrmRepository } from '../../../users/infrastructure/orm/users.orm-repository';

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
    private readonly commentsRepository: CommentsOrmRepository,
    private readonly usersRepository: UsersOrmRepository,
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
