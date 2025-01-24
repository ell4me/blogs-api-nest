import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentCreateDto } from '../../comments.dto';
import { CommentCreate } from '../../comments.types';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

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
    private readonly commentsRepository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute({
    commentCreateDto: { content },
    userId,
    postId,
  }: CreateCommentCommand): Promise<TExecuteCreateComment> {
    const user = await this.usersRepository.findOrNotFoundFail(userId);
    const newComment: CommentCreate = {
      id: new Date().getTime().toString(),
      content,
      postId,
      commentatorInfo: {
        userId,
        userLogin: user.login,
      },
    };

    const createdComment = await this.commentsRepository.create(newComment);
    return { id: createdComment.id };
  }
}
