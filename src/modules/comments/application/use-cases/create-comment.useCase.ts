import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UserViewDto } from '../../../users/users.dto';
import { CommentCreateDto } from '../../comments.dto';
import { CommentCreate } from '../../comments.types';

export type TExecuteCreateComment = { id: string };

export class CreateCommentCommand {
  constructor(
    public commentCreateDto: CommentCreateDto,
    public postId: string,
    public user: UserViewDto,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, TExecuteCreateComment>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute({
    commentCreateDto: { content },
    user,
    postId,
  }: CreateCommentCommand): Promise<TExecuteCreateComment> {
    const newComment: CommentCreate = {
      id: new Date().getTime().toString(),
      content,
      postId,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
    };

    const createdComment = await this.commentsRepository.create(newComment);
    return { id: createdComment.id };
  }
}
