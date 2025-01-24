import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { FilteredPostQueries, ItemsPaginationViewDto } from '../../../types';
import { PostViewDto } from '../posts.dto';
import { LikesPostQueryRepository } from '../../likesPost/infrastructure/likesPost.query-repository';

import { Post, TPostModel } from './posts.model';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private readonly PostsModel: TPostModel,
    private readonly likesPostQueryRepository: LikesPostQueryRepository,
  ) {}

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
    const postsQuery = this.PostsModel.find();

    if (searchNameTerm) {
      postsQuery.where('title').regex(RegExp(searchNameTerm, 'i'));
    }

    if (additionalFilter?.blogId) {
      postsQuery.where('blogId', additionalFilter.blogId);
    }

    const posts: Post[] = await postsQuery
      .skip((pageNumber - 1) * pageSize)
      .sort({ [sortBy]: sortDirection })
      .limit(pageSize)
      .select('-__v -_id -updatedAt')
      .lean();

    const postIds = posts.map(({ id }) => id);
    const likesByPostIds = await this.likesPostQueryRepository.getByPostIds(
      postIds,
      userId,
    );

    const postsCountByFilter = await this.getCountPosts(additionalFilter);

    return {
      page: pageNumber,
      pagesCount: Math.ceil(postsCountByFilter / pageSize),
      pageSize: pageSize,
      totalCount: postsCountByFilter,
      items: posts.map((post) => ({
        ...post,
        extendedLikesInfo: likesByPostIds[post.id],
      })),
    };
  }

  async getPostById(
    postId: string,
    userId?: string,
  ): Promise<PostViewDto | null> {
    const post: Post | null = await this.PostsModel.findOne({ id: postId })
      .select('-__v -_id -updatedAt')
      .lean();

    if (!post) {
      return post;
    }

    const extendedLikesInfo = await this.likesPostQueryRepository.getByPostId(
      postId,
      userId,
    );

    return { ...post, extendedLikesInfo };
  }

  getCountPosts(filter?: { blogId?: string }): Promise<number> {
    const postsQueryCount = this.PostsModel.countDocuments();

    if (filter?.blogId) {
      postsQueryCount.where('blogId', filter.blogId);
    }

    return postsQueryCount.exec();
  }
}
