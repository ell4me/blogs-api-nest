import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  ItemsPaginationViewDto,
  PostQueries,
  TSortDirection,
} from '../../../../types';
import { PostViewDto } from '../../posts.dto';
import { STATUSES_LIKE } from '../../../../constants';

import { Post } from './post.entity';

@Injectable()
export class PostsOrmQueryRepository {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    // private readonly likesPostPgQueryRepository: LikesPostPgQueryRepository,
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
    const sortByQuery = sortBy === 'blogName' ? `b."name"` : `p."${sortBy}"`;
    const builder = this.postsRepository
      .createQueryBuilder('p')
      .where('p."title" ilike :searchNameTerm', {
        searchNameTerm: `%${searchNameTerm}%`,
      })
      .leftJoinAndSelect('p.blog', 'b')
      .orderBy(
        sortByQuery,
        String(sortDirection).toUpperCase() as TSortDirection,
      )
      .limit(pageSize)
      .offset(offset);

    if (additionalFilter?.blogId) {
      builder.andWhere('p."blogId" like :blogId', {
        blogId: additionalFilter?.blogId,
      });
    }

    const posts = await builder.getMany();
    const postsCountByFilter = await this.getCount(additionalFilter);
    // const newestLikes =
    //   await this.likesPostPgQueryRepository.getNewestLikesByPostsId(
    //     posts.map(({ id }) => id),
    //   );

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
        blogName: post.blog.name,
        createdAt: new Date(post.createdAt),
        shortDescription: post.shortDescription,
        extendedLikesInfo: {
          newestLikes: [],
          likesCount: 0,
          dislikesCount: 0,
          myStatus: STATUSES_LIKE.NONE,
        },
      })),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getById(postId: string, userId?: string): Promise<PostViewDto | null> {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: { blog: true },
    });

    if (!post) {
      return null;
    }

    // const newestLikes =
    //   await this.likesPostPgQueryRepository.getNewestLikesByPostId(post.id);

    return {
      id: post.id,
      content: post.content,
      blogId: post.blogId,
      title: post.title,
      blogName: post.blog.name,
      createdAt: new Date(post.createdAt),
      shortDescription: post.shortDescription,
      extendedLikesInfo: {
        newestLikes: [],
        likesCount: 0,
        dislikesCount: 0,
        myStatus: STATUSES_LIKE.NONE,
      },
    };
  }

  getCount(filter?: { blogId?: string }): Promise<number> {
    const blogId = filter?.blogId || '';

    return this.postsRepository
      .createQueryBuilder()
      .where('"blogId" like :blogId', { blogId: `%${blogId}%` })
      .getCount();
  }
}
