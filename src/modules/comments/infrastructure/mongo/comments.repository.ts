import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';

import { NotFoundDomainException } from '../../../../common/exception/domain-exception';
import { CommentCreateDto } from '../../comments.dto';

import { Comment, CommentDocument, TCommentModel } from './comments.model';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private readonly CommentsModel: TCommentModel,
  ) {}

  async create(
    { content }: CommentCreateDto,
    userId: string,
    postId: string,
  ): Promise<CommentDocument> {
    const createdComment = new this.CommentsModel({
      id: Date.now().toString(),
      content,
      commentatorInfo: {
        userId,
      },
      postId,
    });
    await createdComment.save();

    return createdComment;
  }

  async save(comment: CommentDocument): Promise<CommentDocument> {
    return comment.save();
  }

  async findOrNotFoundFail(id: string): Promise<CommentDocument> {
    const comment = await this.CommentsModel.findOne({ id });

    if (!comment) {
      throw NotFoundDomainException.create();
    }

    return comment;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.CommentsModel.deleteOne({ id }).exec();

    return result.deletedCount === 1;
  }

  deleteAll(): Promise<DeleteResult> {
    return this.CommentsModel.deleteMany().exec();
  }
}
