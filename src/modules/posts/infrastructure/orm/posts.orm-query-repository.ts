import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  ItemsPaginationViewDto,
  PostQueries,
  TSortDirection,
} from '../../../../types';
import { PostRawViewDto, PostViewDto } from '../../posts.dto';
import { STATUSES_LIKE } from '../../../../constants';
import { LikesPost } from '../../../likes-post/infrastructure/orm/likes-post.entity';
import { NewestLikeInfo } from '../../../likes-post/likes-post.types';
import { LikesPostOrmQueryRepository } from '../../../likes-post/infrastructure/orm/likes-post.orm-query-repository';

import { Post } from './post.entity';

@Injectable()
export class PostsOrmQueryRepository {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    private readonly likesPostQueryRepository: LikesPostOrmQueryRepository,
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
    const offset = (pageNumber - 1) * pageSize;
    const sortByQuery =
      sortBy === 'blogName' ? `blogs."name"` : `posts."${sortBy}"`;
    const builder = this.getPostBuilder(userId)
      .where('posts."title" ilike :searchNameTerm', {
        searchNameTerm: `%${searchNameTerm}%`,
      })
      .orderBy(
        sortByQuery,
        String(sortDirection).toUpperCase() as TSortDirection,
      )
      .limit(pageSize)
      .offset(offset);

    if (additionalFilter?.blogId) {
      builder.andWhere('posts."blogId" like  :blogId', {
        blogId: additionalFilter?.blogId,
      });
    }

    const posts = await builder.getRawMany<PostRawViewDto>();
    const postsCountByFilter = await this.getCount(additionalFilter);
    const newestLikes =
      await this.likesPostQueryRepository.getNewestLikesByPostsId(
        posts.map(({ id }) => id),
      );

    return {
      page: pageNumber,
      pagesCount: Math.ceil(postsCountByFilter / pageSize),
      pageSize: pageSize,
      totalCount: postsCountByFilter,
      items: posts.map((post) =>
        this.mapToPostViewDto(post, newestLikes[post.id]),
      ),
    };
  }

  async getById(postId: string, userId?: string): Promise<PostViewDto | null> {
    const post = await this.getPostBuilder(userId)
      .where('posts.id = :postId', { postId })
      .getRawOne<PostRawViewDto>();

    if (!post) {
      return null;
    }

    const newestLikes =
      await this.likesPostQueryRepository.getNewestLikesByPostId(post.id);

    return this.mapToPostViewDto(post, newestLikes);
  }

  getCount(filter?: { blogId?: string }): Promise<number> {
    const blogId = filter?.blogId || '';

    return this.postsRepository
      .createQueryBuilder()
      .where('"blogId" like :blogId', { blogId: `%${blogId}%` })
      .getCount();
  }

  private mapToPostViewDto(
    post: PostRawViewDto,
    newestLikes: NewestLikeInfo[],
  ): PostViewDto {
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
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: Post.getCurrentStatusLikeUser(post.currentLikeStatusUser),
      },
    };
  }

  private getPostBuilder(userId?: string): SelectQueryBuilder<Post> {
    return this.postsRepository
      .createQueryBuilder('posts')
      .select([
        'posts."id"',
        'posts."content"',
        'posts."blogId"',
        'posts."title"',
        'posts."createdAt"',
        'posts."shortDescription"',
        'blogs."name" as "blogName"',
        'likes."status" as "currentLikeStatusUser"',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('CAST(COUNT(status) AS INT)', 'likesCount')
            .where('lp.status = :likeStatus', {
              likeStatus: STATUSES_LIKE.LIKE,
            })
            .from(LikesPost, 'lp'),
        'likesCount',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('CAST(COUNT(status) AS INT)', 'likesCount')
            .where('lp.status = :dislikeStatus', {
              dislikeStatus: STATUSES_LIKE.DISLIKE,
            })
            .from(LikesPost, 'lp'),
        'dislikesCount',
      )
      .leftJoin('posts.blog', 'blogs')
      .leftJoin('posts.likes', 'likes', 'likes."userId" = :userId', { userId });
  }
}
