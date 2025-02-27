import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { NotFoundDomainException } from '../../../../common/exception/domain-exception';
import { BlogCreateDto } from '../../blogs.dto';

import { Blog } from './blog.entity';

@Injectable()
export class BlogsOrmRepository {
  constructor(
    @InjectRepository(Blog) private readonly blogsRepository: Repository<Blog>,
  ) {}

  getById(id: string): Promise<Blog | null> {
    return this.blogsRepository.findOneBy({ id });
  }

  save(blog: Blog): Promise<Blog> {
    return this.blogsRepository.save(blog);
  }

  async create(blogCreateDto: BlogCreateDto): Promise<Blog> {
    const blog = Blog.create(blogCreateDto);
    return this.blogsRepository.save(blog);
  }

  async deleteOrNotFoundFail(id: string): Promise<boolean> {
    const { affected } = await this.blogsRepository.delete({ id });

    if (!affected) {
      throw NotFoundDomainException.create();
    }

    return true;
  }

  deleteAll(): Promise<DeleteResult> {
    return this.blogsRepository.delete({});
  }
}
