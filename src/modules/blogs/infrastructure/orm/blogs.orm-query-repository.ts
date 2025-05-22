import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ElasticsearchService } from '@nestjs/elasticsearch';

import { BlogQueries } from '../../../../types';
import { BlogViewDto } from '../../api/blogs.dto';
import { PaginationViewDto } from '../../../../common/dto/pagination-view.dto';
import { BLOGS_INDEX } from '../../application/constants';

import { Blog } from './blog.entity';

@Injectable()
export class BlogsOrmQueryRepository {
  constructor(
    @InjectRepository(Blog) private readonly blogsRepository: Repository<Blog>,
    private readonly esClient: ElasticsearchService,
  ) {}

  async getAll({
    pageSize,
    pageNumber,
    searchNameTerm,
  }: BlogQueries): Promise<PaginationViewDto<BlogViewDto>> {
    const offset = (pageNumber - 1) * pageSize;

    const result = await this.esClient.search<Blog>({
      index: BLOGS_INDEX,
      from: offset,
      size: pageSize,
      query: searchNameTerm
        ? {
            multi_match: {
              query: searchNameTerm,
              fields: ['description', 'name'],
            },
          }
        : { match_all: {} },
    });

    // const blogs = await this.blogsRepository
    //   .createQueryBuilder()
    //   .where('name ILIKE :searchNameTerm', {
    //     searchNameTerm: `%${searchNameTerm}%`,
    //   })
    //   .orderBy(
    //     `"${sortBy}"`,
    //     String(sortDirection).toUpperCase() as TSortDirection,
    //   )
    //   .limit(pageSize)
    //   .offset(offset)
    //   .getMany();

    // const totalCount = await this.getCountBlogsByFilter(searchNameTerm);

    const totalCount = result.hits.total as { value: number; relation: string };
    const blogs = result.hits.hits.map((hit) => hit._source) as Blog[];

    return {
      page: pageNumber,
      pagesCount: Math.ceil(totalCount.value / pageSize),
      pageSize: pageSize,
      totalCount: totalCount.value,
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
