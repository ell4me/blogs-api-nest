import { DeleteResult, ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { BlogUpdateDto, BlogViewDto } from '../../blogs.dto';
import { BlogCreate } from '../../blogs.types';
import { NotFoundDomainException } from '../../../../common/exception/domain-exception';

import { Blog, BlogDocument, TBlogModel } from './blogs.model';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private readonly BlogsModel: TBlogModel,
  ) {}

  async updateOrNotFoundFail(
    id: string,
    newBlog: BlogUpdateDto,
  ): Promise<BlogViewDto> {
    const blog = await this.BlogsModel.findOneAndUpdate({ id }, newBlog, {
      returnDocument: 'before',
    }).exec();

    if (!blog) {
      throw NotFoundDomainException.create();
    }

    return blog;
  }

  async create(createdBlog: BlogCreate): Promise<ObjectId> {
    const { _id } = await this.BlogsModel.create(createdBlog);

    return _id;
  }

  async save(blog: BlogDocument): Promise<BlogDocument> {
    return blog.save();
  }

  async deleteOrNotFoundFail(id: string): Promise<boolean> {
    const result = await this.BlogsModel.deleteOne({ id }).exec();

    if (!result.deletedCount) {
      throw NotFoundDomainException.create();
    }

    return true;
  }

  deleteAll(): Promise<DeleteResult> {
    return this.BlogsModel.deleteMany().exec();
  }
}
