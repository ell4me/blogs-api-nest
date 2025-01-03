import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ItemsPaginationViewDto, PaginationQueries } from '../../types';

import { CommentViewDto } from './comments.dto';
import { getLikesInfoByUser } from './helpers/getLikesInfoByUser';
import { Comment, TCommentModel } from './comments.model';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentsModel: TCommentModel,
  ) {}

  async getCommentsByPostId(
    postId: string,
    {
      pageSize = 10,
      pageNumber = 1,
      sortBy = 'createdAt',
      sortDirection = 'desc',
    }: PaginationQueries,
    userId?: string,
  ): Promise<ItemsPaginationViewDto<CommentViewDto>> {
    const pageSizeToNumber = Number(pageSize);
    const pageNumberToNumber = Number(pageNumber);
    const comments: Comment[] = await this.CommentsModel.find({ postId })
      .skip((pageNumberToNumber - 1) * pageSizeToNumber)
      .sort({ [sortBy]: sortDirection })
      .limit(pageSizeToNumber)
      .select('-__v -_id -updatedAt -postId')
      .lean();

    const commentsCountByFilter = await this.getCountComments(postId);

    return {
      page: pageNumberToNumber,
      pagesCount: Math.ceil(commentsCountByFilter / pageSizeToNumber),
      pageSize: pageSizeToNumber,
      totalCount: commentsCountByFilter,
      items: comments.length
        ? comments.map((comment) => ({
            ...comment,
            likesInfo: getLikesInfoByUser(comment?.likesInfo, userId),
          }))
        : [],
    };
  }

  async getCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentViewDto | null> {
    const comment: Comment | null = await this.CommentsModel.findOne({
      id: commentId,
    })
      .select('-__v -_id -updatedAt -postId')
      .lean();

    if (!comment) {
      return null;
    }

    return {
      ...comment,
      likesInfo: getLikesInfoByUser(comment.likesInfo, userId),
    };
  }

  getCountComments(postId: string): Promise<number> {
    return this.CommentsModel.countDocuments({ postId }).exec();
  }
}
