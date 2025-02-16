import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CommentQueries, ItemsPaginationViewDto } from '../../../../types';
import { CommentViewDto } from '../../comments.dto';

import { CommentEntity } from './comments.entity';

@Injectable()
export class CommentsPgQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getCommentsByPostId(
    postId: string,
    { pageSize, pageNumber, sortBy, sortDirection }: CommentQueries,
    userId?: string,
  ): Promise<ItemsPaginationViewDto<CommentViewDto>> {
    const offset = (pageNumber - 1) * pageSize;
    const comments: CommentEntity[] = await this.dataSource.query(
      `
      SELECT c.id, c.content, c."createdAt", c."commentatorId", u.login AS "commentatorLogin", lc.status as "currentLikeStatusUser",
      (
         SELECT count(status) FROM "LikesComment" as lc
         WHERE lc."commentId"=c.id AND lc."status"='Like'
       ) as "likes",
       (
         SELECT count(status) FROM "LikesComment" as lc
         WHERE lc."commentId"=c.id AND lc."status"='Dislike'
       ) as "dislikes"
      FROM "Comments" AS c
      LEFT JOIN "Users" AS u
      ON c."commentatorId"=u.id
      LEFT JOIN "LikesComment" AS lc
      ON  lc."commentId"=c.id AND lc."userId"=$1
      WHERE c."postId"=$2
      ORDER BY c."${sortBy}" ${sortDirection}
      LIMIT $3 OFFSET $4
    `,
      [userId, postId, pageSize, offset],
    );

    const commentsCountByFilter = await this.getCountComments(postId);

    return {
      page: pageNumber,
      pagesCount: Math.ceil(commentsCountByFilter / pageSize),
      pageSize: pageSize,
      totalCount: commentsCountByFilter,
      items: comments.length
        ? comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
              userId: comment.commentatorId,
              userLogin: comment.commentatorLogin,
            },
            createdAt: comment.createdAt,
            likesInfo: {
              likesCount: Number(comment.likes),
              dislikesCount: Number(comment.dislikes),
              myStatus: CommentEntity.getCurrentStatusLikeUser(
                comment.currentLikeStatusUser,
              ),
            },
          }))
        : [],
    };
  }

  async getCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentViewDto | null> {
    const result: CommentEntity[] = await this.dataSource.query(
      `
       SELECT c.id, c.content, c."createdAt", c."commentatorId", u.login AS "commentatorLogin", lc.status as "currentLikeStatusUser",
        (
         SELECT count(status) FROM "LikesComment" as lc
         WHERE lc."commentId"=c.id AND lc."status"='Like'
       ) as "likes",
       (
         SELECT count(status) FROM "LikesComment" as lc
         WHERE lc."commentId"=c.id AND lc."status"='Dislike'
       ) as "dislikes"
       FROM "Comments" AS c
       JOIN "Users" AS u
       ON c."commentatorId"=u.id
       LEFT JOIN "LikesComment" AS lc
       ON  lc."commentId"=c.id AND lc."userId"=$1
       WHERE c."id"=$2
    `,
      [userId, commentId],
    );

    const comment = result[0];

    if (!comment) {
      return null;
    }

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorId,
        userLogin: comment.commentatorLogin,
      },
      createdAt: new Date(comment.createdAt),
      likesInfo: {
        likesCount: Number(comment.likes),
        dislikesCount: Number(comment.dislikes),
        myStatus: CommentEntity.getCurrentStatusLikeUser(
          comment.currentLikeStatusUser,
        ),
      },
    };
  }

  async getCountComments(postId: string): Promise<number> {
    const result = await this.dataSource.query(
      `
      SELECT count(*) FROM "Comments"
      WHERE "postId"=$1
    `,
      [postId],
    );

    return Number(result[0].count);
  }
}
