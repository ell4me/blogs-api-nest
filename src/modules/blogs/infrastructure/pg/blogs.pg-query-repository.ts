import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { BlogQueries, ItemsPaginationViewDto } from '../../../../types';
import { BlogViewDto } from '../../blogs.dto';

@Injectable()
export class BlogsPgQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getAll({
    pageSize,
    pageNumber,
    sortBy,
    sortDirection,
    searchNameTerm,
  }: BlogQueries): Promise<ItemsPaginationViewDto<BlogViewDto>> {
    const offset = (pageNumber - 1) * pageSize;
    const blogs = await this.dataSource.query(
      `
      SELECT "id", "name", "description", "websiteUrl", "isMembership", "createdAt" FROM "Blogs"
      WHERE "name" ilike $1
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $2 OFFSET $3
    `,
      [`%${searchNameTerm}%`, pageSize, offset],
    );

    const totalCount = await this.getCountBlogsByFilter(searchNameTerm);

    return {
      page: pageNumber,
      pagesCount: Math.ceil(totalCount / pageSize),
      pageSize: pageSize,
      totalCount,
      items: blogs,
    };
  }

  async getById(id: string): Promise<BlogViewDto | null> {
    const result = await this.dataSource.query(
      `
      SELECT "id", "name", "description", "websiteUrl", "isMembership", "createdAt" FROM "Blogs"
      WHERE "id"=$1
    `,
      [id],
    );

    return result[0] ? result[0] : null;
  }

  async getCountBlogsByFilter(searchNameTerm: string | null): Promise<number> {
    const result = await this.dataSource.query(
      `SELECT count(*) FROM "Blogs"
      WHERE "name" ilike $1`,
      [`%${searchNameTerm}%`],
    );

    return Number(result[0].count);
  }
}
