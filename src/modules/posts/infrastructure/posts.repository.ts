import { DeleteResult } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Post, PostDocument, TPostModel } from './posts.model';
import { PostCreateByBlogIdDto } from '../posts.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostsModel: TPostModel) {}

  async getById(id: string): Promise<PostDocument | null> {
    return this.PostsModel.findOne({ id }).exec();
  }

  async deleteAllByBlogId(blogId: string): Promise<boolean> {
    const result = await this.PostsModel.deleteMany({ blogId }).exec();

    return !!result;
  }

  async save(post: PostDocument): Promise<PostDocument> {
    return post.save();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.PostsModel.deleteOne({ id }).exec();

    return result.deletedCount === 1;
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
