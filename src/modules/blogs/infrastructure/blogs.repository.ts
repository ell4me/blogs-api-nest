import { DeleteResult, ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { BlogUpdateDto, BlogViewDto } from '../blogs.dto';
import { BlogCreate } from '../blogs.types';
import { Blog, BlogDocument, TBlogModel } from './blogs.model';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogsModel: TBlogModel) {}

  updateById(id: string, newBlog: BlogUpdateDto): Promise<BlogViewDto | null> {
    return this.BlogsModel.findOneAndUpdate({ id }, newBlog, {
      returnDocument: 'before',
    }).exec();
  }

  async create(createdBlog: BlogCreate): Promise<ObjectId> {
    const { _id } = await this.BlogsModel.create(createdBlog);

    return _id;
  }

  async save(blog: BlogDocument): Promise<BlogDocument> {
    return blog.save();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.BlogsModel.deleteOne({ id }).exec();

    return result.deletedCount === 1;
  }

  deleteAll(): Promise<DeleteResult> {
    return this.BlogsModel.deleteMany().exec();
  }
}
