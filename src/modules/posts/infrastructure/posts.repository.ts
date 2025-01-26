import { DeleteResult } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { PostCreateByBlogIdDto } from '../posts.dto';
import { NotFoundDomainException } from '../../../common/exception/domain-exception';

import { Post, PostDocument, TPostModel } from './posts.model';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private readonly PostsModel: TPostModel,
  ) {}

  async findOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.PostsModel.findOne({ id }).exec();

    if (!post) {
      throw NotFoundDomainException.create();
    }

    return post;
  }

  async deleteAllByBlogId(blogId: string): Promise<boolean> {
    const result = await this.PostsModel.deleteMany({ blogId }).exec();

    return !!result;
  }

  async save(post: PostDocument): Promise<PostDocument> {
    return post.save();
  }

  async deleteOrNotFoundFail(id: string): Promise<boolean> {
    const result = await this.PostsModel.deleteOne({ id }).exec();

    if (!result.deletedCount) {
      throw NotFoundDomainException.create();
    }

    return true;
  }

  deleteAll(): Promise<DeleteResult> {
    return this.PostsModel.deleteMany().exec();
  }

  async updateByBlogId(blogId: string, blogName: string): Promise<boolean> {
    const result = await this.PostsModel.updateMany(
      { blogId },
      { blogName },
    ).exec();

    return !!result;
  }

  async create(
    newPost: PostCreateByBlogIdDto,
    blogName: string,
  ): Promise<PostDocument> {
    const post = this.PostsModel.createInstance(
      newPost,
      blogName,
      this.PostsModel,
    );
    return await post.save();
  }
}
