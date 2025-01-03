import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { FilteredBlogQueries, ItemsPaginationViewDto } from '../../types';

import { PostViewDto } from './posts.dto';
import { Post, TPostModel } from './posts.model';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostsModel: TPostModel) {}

  async getAllPosts(
    {
      pageSize = 10,
      pageNumber = 1,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      searchNameTerm,
    }: FilteredBlogQueries,
    additionalFilter?: { blogId?: string },
  ): Promise<ItemsPaginationViewDto<PostViewDto>> {
    const postsQuery = this.PostsModel.find();
    const pageSizeToNumber = Number(pageSize);
    const pageNumberToNumber = Number(pageNumber);

    if (searchNameTerm) {
      postsQuery.where('title').regex(RegExp(searchNameTerm, 'i'));
    }

    if (additionalFilter?.blogId) {
      postsQuery.where('blogId', additionalFilter.blogId);
    }

    const posts: Post[] = await postsQuery
      .skip((pageNumberToNumber - 1) * pageSizeToNumber)
      .sort({ [sortBy]: sortDirection })
      .limit(pageSizeToNumber)
      .select('-__v -_id -updatedAt')
      .lean();

    const postsCountByFilter = await this.getCountPosts(additionalFilter);

    return {
      page: pageNumberToNumber,
      pagesCount: Math.ceil(postsCountByFilter / pageSizeToNumber),
      pageSize: pageSizeToNumber,
      totalCount: postsCountByFilter,
      items: posts.map((post) => ({
        ...post,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          newestLikes: [],
          myStatus: 'None',
        },
      })),
    };
  }

  async getPostById(postId: string): Promise<PostViewDto | null> {
    const post: Post | null = await this.PostsModel.findOne({ id: postId })
      .select('-__v -_id -updatedAt')
      .lean();

    if (!post) {
      return post;
    }

    return {
      ...post,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        newestLikes: [],
        myStatus: 'None',
      },
    };
  }

  getCountPosts(filter?: { blogId?: string }): Promise<number> {
    const postsQueryCount = this.PostsModel.countDocuments();

    if (filter?.blogId) {
      postsQueryCount.where('blogId', filter.blogId);
    }

    return postsQueryCount.exec();
  }
}
