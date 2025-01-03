import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { FilteredBlogQueries, ItemsPaginationViewDto } from '../../types';

import { BlogViewDto } from './blogs.dto';
import { Blog, TBlogModel } from './blogs.model';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogsModel: TBlogModel) {}

  async getAll({
    pageSize = 10,
    pageNumber = 1,
    sortBy = 'createdAt',
    sortDirection = 'desc',
    searchNameTerm,
  }: FilteredBlogQueries): Promise<ItemsPaginationViewDto<BlogViewDto>> {
    const pageSizeToNumber = Number(pageSize);
    const pageNumberToNumber = Number(pageNumber);
    const blogsQuery = this.BlogsModel.find();

    if (searchNameTerm) {
      blogsQuery.where('name').regex(new RegExp(searchNameTerm, 'i'));
    }

    const blogs = await blogsQuery
      .skip((pageNumberToNumber - 1) * pageSizeToNumber)
      .sort({ [sortBy]: sortDirection })
      .limit(pageSizeToNumber)
      .select('-_id -__v -updatedAt')
      .exec();

    const totalCount = await this.getCountBlogsByFilter(searchNameTerm);

    return {
      page: pageNumberToNumber,
      pagesCount: Math.ceil(totalCount / pageSizeToNumber),
      pageSize: pageSizeToNumber,
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
