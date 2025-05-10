import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { BlogQueries, TSortDirection } from '../../../../types';
import { BlogViewDto } from '../../api/blogs.dto';
import { PaginationViewDto } from '../../../../common/dto/pagination-view.dto';

import { Blog } from './blog.entity';

@Injectable()
export class BlogsOrmQueryRepository {
  constructor(
    @InjectRepository(Blog) private readonly blogsRepository: Repository<Blog>,
  ) {}

  async getAll({
    pageSize,
    pageNumber,
    sortBy,
    sortDirection,
    searchNameTerm,
  }: BlogQueries): Promise<PaginationViewDto<BlogViewDto>> {
    const offset = (pageNumber - 1) * pageSize;

    const blogs = await this.blogsRepository
      .createQueryBuilder()
      .where('name ILIKE :searchNameTerm', {
        searchNameTerm: `%${searchNameTerm}%`,
      })
      .orderBy(
        `"${sortBy}"`,
        String(sortDirection).toUpperCase() as TSortDirection,
      )
      .limit(pageSize)
      .offset(offset)
      .getMany();

    const totalCount = await this.getCountBlogsByFilter(searchNameTerm);

    return {
      page: pageNumber,
      pagesCount: Math.ceil(totalCount / pageSize),
      pageSize: pageSize,
      totalCount,
      items: blogs.map(
        ({ description, createdAt, name, websiteUrl, isMembership, id }) => ({
          id,
          description,
          createdAt,
          name,
          websiteUrl,
          isMembership,
        }),
      ),
    };
  }

  async getById(id: string): Promise<BlogViewDto | null> {
    const blog = await this.blogsRepository.findOneBy({ id });

    if (!blog) {
      return null;
    }

    return {
      id: blog.id,
      name: blog.name,
      websiteUrl: blog.websiteUrl,
      isMembership: blog.isMembership,
      description: blog.description,
      createdAt: blog.createdAt,
    };
  }

  async getCountBlogsByFilter(searchNameTerm: string | null): Promise<number> {
    return this.blogsRepository
      .createQueryBuilder()
      .where('name ILIKE :searchNameTerm', {
        searchNameTerm: `%${searchNameTerm}%`,
      })
      .getCount();
  }
}
