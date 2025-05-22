import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';
import { ElasticsearchService } from '@nestjs/elasticsearch';

import { NotFoundDomainException } from '../../../../common/exception/domain-exception';
import { BlogCreateDto } from '../../api/blogs.dto';
import { BLOGS_INDEX } from '../../application/constants';

import { Blog } from './blog.entity';

@Injectable()
export class BlogsOrmRepository {
  constructor(
    @InjectRepository(Blog) private readonly blogsRepository: Repository<Blog>,
    private readonly esClient: ElasticsearchService,
  ) {}

  getAll(): Promise<Blog[]> {
    return this.blogsRepository.find();
  }

  getById(id: string): Promise<Blog | null> {
    return this.blogsRepository.findOneBy({ id });
  }

  async save(blog: Blog): Promise<Blog> {
    const updatedBlog = await this.blogsRepository.save(blog);

    await this.esClient.update<Blog>({
      index: BLOGS_INDEX,
      id: updatedBlog.id,
      doc: updatedBlog,
    });

    return updatedBlog;
  }

  async create(blogCreateDto: BlogCreateDto): Promise<Blog> {
    const blog = Blog.create(blogCreateDto);
    const createdBlog = await this.blogsRepository.save(blog);

    await this.esClient.index<Blog>({
      index: BLOGS_INDEX,
      id: createdBlog.id,
      document: createdBlog,
    });

    return createdBlog;
  }

  async deleteOrNotFoundFail(id: string): Promise<boolean> {
    const { affected } = await this.blogsRepository.delete({ id });

    if (!affected) {
      throw NotFoundDomainException.create();
    }

    await this.esClient.delete({
      index: BLOGS_INDEX,
      id,
    });

    return true;
  }

  deleteAll(): Promise<DeleteResult> {
    return this.blogsRepository.delete({});
  }
}
