import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { FilteredPostQueries, ItemsPaginationViewDto } from '../../../types';
import { PostViewDto } from '../posts.dto';
import { STATUSES_LIKE } from '../../../constants';

@Injectable()
export class PostsPgQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getAllPosts(
    {
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
      searchNameTerm,
    }: FilteredPostQueries,
    userId?: string,
    additionalFilter?: { blogId?: string },
  ): Promise<ItemsPaginationViewDto<PostViewDto>> {
    const offset = (pageNumber - 1) * pageSize;
    const posts = await this.dataSource.query(
      `
      SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", p."createdAt", b."name" AS "blogName" 
	    FROM "Posts" AS p
	    LEFT JOIN "Blogs" AS b  
      ON b."id"=p."blogId"
	    WHERE p."title" ilike $1 and p."blogId"=$2
      ORDER BY p."${sortBy}" ${sortDirection}
      LIMIT $3 OFFSET $4
    `,
      [`%${searchNameTerm}%`, additionalFilter?.blogId, pageSize, offset],
    );

    // const postIds = posts.map(({ id }) => id);
    // const likesByPostIds = await this.likesPostQueryRepository.getByPostIds(
    //   postIds,
    //   userId,
    // );

    const postsCountByFilter = await this.getCountPosts(additionalFilter);

    return {
      page: pageNumber,
      pagesCount: Math.ceil(postsCountByFilter / pageSize),
      pageSize: pageSize,
      totalCount: postsCountByFilter,
      items: posts.map((post) => ({
        ...post,
        extendedLikesInfo: {
          newestLikes: [],
          likesCount: 0,
          dislikesCount: 0,
          myStatus: STATUSES_LIKE.NONE,
        },
      })),
    };
  }

  async getPostById(
    postId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId?: string,
  ): Promise<PostViewDto | null> {
    const post = await this.dataSource.query(
      `SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", p."createdAt", b."name" AS "blogName" FROM "Posts" AS p
      LEFT JOIN "Blogs" AS b  
      ON b."id"=p."blogId"
      WHERE p."id"=$1`,
      [postId],
    );

    if (!post[0]) {
      return null;
    }

    // const extendedLikesInfo = await this.likesPostQueryRepository.getByPostId(
    //   postId,
    //   userId,
    // );

    return {
      ...post[0],
      extendedLikesInfo: {
        newestLikes: [],
        likesCount: 0,
        dislikesCount: 0,
        myStatus: STATUSES_LIKE.NONE,
      },
    };
  }

  async getCountPosts(filter?: { blogId?: string }): Promise<number> {
    const result = await this.dataSource.query(
      `SELECT count(*) FROM "Posts"
      WHERE "blogId"=$1`,
      [filter?.blogId],
    );

    return Number(result[0].count);
  }
}
