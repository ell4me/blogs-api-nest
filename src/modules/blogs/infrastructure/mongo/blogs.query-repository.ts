import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { BlogQueries, ItemsPaginationViewDto } from '../../../../types';
import { BlogViewDto } from '../../blogs.dto';

import { Blog, TBlogModel } from './blogs.model';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private readonly BlogsModel: TBlogModel,
  ) {}

  async getAll({
    pageSize,
    pageNumber,
    sortBy,
    sortDirection,
    searchNameTerm,
  }: BlogQueries): Promise<ItemsPaginationViewDto<BlogViewDto>> {
    const blogsQuery = this.BlogsModel.find();
    if (searchNameTerm) {
      blogsQuery.where('name').regex(new RegExp(searchNameTerm, 'i'));
    }

    const blogs = await blogsQuery
      .skip((pageNumber - 1) * pageSize)
      .sort({ [sortBy]: sortDirection })
      .limit(pageSize)
      .select('-_id -__v -updatedAt')
      .exec();

    const totalCount = await this.getCountBlogsByFilter(searchNameTerm);

    return {
      page: pageNumber,
      pagesCount: Math.ceil(totalCount / pageSize),
      pageSize: pageSize,
      totalCount,
      items: blogs,
    };
  }

  getById(id: string): Promise<BlogViewDto | null> {
    return this.BlogsModel.findOne({ id })
      .select('-_id -__v -updatedAt')
      .exec();
  }

  getCountBlogsByFilter(searchNameTerm: string | null): Promise<number> {
    const blogsCountQuery = this.BlogsModel.countDocuments();

    if (searchNameTerm) {
      blogsCountQuery.where('name').regex(new RegExp(searchNameTerm, 'i'));
    }

    return blogsCountQuery.exec();
  }
}
