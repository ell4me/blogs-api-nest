import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { PostQueries, ItemsPaginationViewDto } from '../../../../types';
import { PostViewDto } from '../../posts.dto';
import { LikesPostPgQueryRepository } from '../../../likes-post/infrastructure/pg/likes-post.pg-query-repository';

import { PostEntity } from './posts.entity';

@Injectable()
export class PostsPgQueryRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly likesPostPgQueryRepository: LikesPostPgQueryRepository,
  ) {}

  async getAll(
    {
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
      searchNameTerm,
    }: PostQueries,
    userId?: string,
    additionalFilter?: { blogId?: string },
  ): Promise<ItemsPaginationViewDto<PostViewDto>> {
    const blogId = additionalFilter?.blogId || '';
    const offset = (pageNumber - 1) * pageSize;
    const sortByQuery = sortBy === 'blogName' ? `"${sortBy}"` : `p."${sortBy}"`;
    const posts: PostEntity[] = await this.dataSource.query(
      `
      SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", p."createdAt",
      b."name" AS "blogName", lp."status" as "currentLikeStatusUser",
        (
            SELECT count(status) FROM "LikesPost" as lp
            WHERE lp."postId"=p.id AND lp."status"='Like'
        ) as likes,
        (
            SELECT count(status) FROM "LikesPost" as lp
            WHERE lp."postId"=p.id AND lp."status"='Dislike'
        ) as dislikes
        FROM "Posts" AS p
        LEFT JOIN "Blogs" AS b  
        ON b."id"=p."blogId"
        LEFT JOIN "LikesPost" as lp
        ON lp."postId" = p."id" AND lp."userId" = $1
        WHERE p."title" ilike $2 and p."blogId" like $3
        ORDER BY ${sortByQuery} ${sortDirection}
        LIMIT $4 OFFSET $5
    `,
      [userId, `%${searchNameTerm}%`, `%${blogId}%`, pageSize, offset],
    );

    const postsCountByFilter = await this.getCount(additionalFilter);
    const newestLikes =
      await this.likesPostPgQueryRepository.getNewestLikesByPostsId(
        posts.map(({ id }) => id),
      );

    return {
      page: pageNumber,
      pagesCount: Math.ceil(postsCountByFilter / pageSize),
      pageSize: pageSize,
      totalCount: postsCountByFilter,
      items: posts.map((post) => ({
        id: post.id,
        content: post.content,
        blogId: post.blogId,
        title: post.title,
        blogName: post.blogName,
        createdAt: new Date(post.createdAt),
        shortDescription: post.shortDescription,
        extendedLikesInfo: {
          newestLikes: newestLikes[post.id],
          likesCount: Number(post.likes),
          dislikesCount: Number(post.dislikes),
          myStatus: PostEntity.getCurrentStatusLikeUser(
            post.currentLikeStatusUser,
          ),
        },
      })),
    };
  }

  async getById(postId: string, userId?: string): Promise<PostViewDto | null> {
    const result: PostEntity[] = await this.dataSource.query(
      `SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", p."createdAt", b."name" AS "blogName", lp."status" as "currentLikeStatusUser",
        (
            SELECT count(status) FROM "LikesPost" as lp
            WHERE lp."postId"=p.id AND lp."status"='Like'
        ) as likes,
        (
            SELECT count(status) FROM "LikesPost" as lp
            WHERE lp."postId"=p.id AND lp."status"='Dislike'
        ) as dislikes 
      FROM "Posts" AS p
      LEFT JOIN "Blogs" AS b  
      ON b."id"=p."blogId"
      LEFT JOIN "LikesPost" as lp
      ON lp."postId" = p."id" AND lp."userId" = $1
      WHERE p."id"=$2`,
      [userId, postId],
    );

    const post = result[0];

    if (!post) {
      return null;
    }

    const newestLikes =
      await this.likesPostPgQueryRepository.getNewestLikesByPostId(post.id);

    return {
      id: post.id,
      content: post.content,
      blogId: post.blogId,
      title: post.title,
      blogName: post.blogName,
      createdAt: new Date(post.createdAt),
      shortDescription: post.shortDescription,
      extendedLikesInfo: {
        newestLikes,
        likesCount: Number(post.likes),
        dislikesCount: Number(post.dislikes),
        myStatus: PostEntity.getCurrentStatusLikeUser(
          post.currentLikeStatusUser,
        ),
      },
    };
  }

  async getCount(filter?: { blogId?: string }): Promise<number> {
    const blogId = filter?.blogId || '';

    const result = await this.dataSource.query(
      `SELECT count(*) FROM "Posts"
      WHERE "blogId" like $1`,
      [`%${blogId}%`],
    );

    return Number(result[0].count);
  }
}
