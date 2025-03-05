import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  CommentQueries,
  ItemsPaginationViewDto,
  TSortDirection,
} from '../../../../types';
import { CommentRawViewDto, CommentViewDto } from '../../comments.dto';
import { STATUSES_LIKE } from '../../../../constants';
import { LikesComment } from '../../../likes-comment/infrastructure/orm/like-comment.entity';

import { Comment } from './comment.entity';

@Injectable()
export class CommentsOrmQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async getCommentsByPostId(
    postId: string,
    { pageSize, pageNumber, sortBy, sortDirection }: CommentQueries,
    userId?: string,
  ): Promise<ItemsPaginationViewDto<CommentViewDto>> {
    const offset = (pageNumber - 1) * pageSize;

    const comments = await this.getCommentBuilder(userId)
      .where(`comment."postId" = :postId`, { postId })
      .orderBy(
        `comment."${sortBy}"`,
        String(sortDirection).toUpperCase() as TSortDirection,
      )
      .limit(pageSize)
      .offset(offset)
      .getRawMany<CommentRawViewDto>();

    const commentsCountByFilter = await this.getCountComments(postId);

    return {
      page: pageNumber,
      pagesCount: Math.ceil(commentsCountByFilter / pageSize),
      pageSize: pageSize,
      totalCount: commentsCountByFilter,
      items: comments.map(this.mapToCommentViewDto),
    };
  }

  async getCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentViewDto | null> {
    const comment = await this.getCommentBuilder(userId)
      .where(`comment."id" = :commentId`, { commentId })
      .getRawOne<CommentRawViewDto>();

    if (!comment) {
      return null;
    }

    return this.mapToCommentViewDto(comment);
  }

  getCountComments(postId: string): Promise<number> {
    return this.commentsRepository.countBy({ postId });
  }

  private mapToCommentViewDto(comment: CommentRawViewDto): CommentViewDto {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorId,
        userLogin: comment.commentatorLogin,
      },
      createdAt: new Date(comment.createdAt),
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: Comment.getCurrentStatusLikeUser(
          comment.currentUserLikeStatus,
        ),
      },
    };
  }

  private getCommentBuilder(userId?: string): SelectQueryBuilder<Comment> {
    return this.commentsRepository
      .createQueryBuilder('comment')
      .select([
        'comment."id"',
        'comment."content"',
        'comment."createdAt"',
        '"likes".status as "currentUserLikeStatus"',
        '"user".id as "commentatorId"',
        '"user".login as "commentatorLogin"',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('CAST(count(status) AS INT)', 'likesCount')
          .where(`lc."commentId" = comment.id AND lc."status" = :statusLike`, {
            statusLike: STATUSES_LIKE.LIKE,
          })
          .from(LikesComment, 'lc');
      }, 'likesCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('CAST(count(status) AS INT)', 'dislikesCount')
          .where(
            `lc."commentId" = comment.id AND lc."status" = :statusDislike`,
            {
              statusDislike: STATUSES_LIKE.DISLIKE,
            },
          )
          .from(LikesComment, 'lc');
      }, 'dislikesCount')
      .leftJoin('comment.commentator', 'user')
      .leftJoin('comment.likes', 'likes', 'likes."userId" = :userId', {
        userId,
      });
  }
}
