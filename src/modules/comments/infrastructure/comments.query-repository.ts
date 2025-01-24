import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ItemsPaginationViewDto, PaginationQueries } from '../../../types';
import { CommentViewDto, LikesInfoDto } from '../comments.dto';
import { STATUSES_LIKE } from '../../../constants';

import { Comment, LikesInfo, TCommentModel } from './comments.model';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private readonly CommentsModel: TCommentModel,
  ) {}

  async getCommentsByPostId(
    postId: string,
    { pageSize, pageNumber, sortBy, sortDirection }: PaginationQueries,
    userId?: string,
  ): Promise<ItemsPaginationViewDto<CommentViewDto>> {
    const comments: Comment[] = await this.CommentsModel.find({ postId })
      .skip((pageNumber - 1) * pageSize)
      .sort({ [sortBy]: sortDirection })
      .limit(pageSize)
      .select('-__v -_id -updatedAt -postId')
      .lean();

    const commentsCountByFilter = await this.getCountComments(postId);

    return {
      page: pageNumber,
      pagesCount: Math.ceil(commentsCountByFilter / pageSize),
      pageSize: pageSize,
      totalCount: commentsCountByFilter,
      items: comments.length
        ? comments.map((comment) => ({
            ...comment,
            likesInfo: this.getLikesInfoByUser(comment?.likesInfo, userId),
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
      likesInfo: this.getLikesInfoByUser(comment.likesInfo, userId),
    };
  }

  getCountComments(postId: string): Promise<number> {
    return this.CommentsModel.countDocuments({ postId }).exec();
  }

  private getLikesInfoByUser(
    likesInfo: LikesInfo,
    userId?: string,
  ): LikesInfoDto {
    let myStatus: STATUSES_LIKE = STATUSES_LIKE.NONE;

    if (userId) {
      if (likesInfo.likes.includes(String(userId))) {
        myStatus = STATUSES_LIKE.LIKE;
      }

      if (likesInfo.dislikes.includes(String(userId))) {
        myStatus = STATUSES_LIKE.DISLIKE;
      }
    }

    return {
      likesCount: likesInfo.likes.length,
      dislikesCount: likesInfo.dislikes.length,
      myStatus,
    };
  }
}
