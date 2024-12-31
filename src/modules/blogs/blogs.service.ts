import { Injectable } from '@nestjs/common';

import { PostsRepository } from '../posts/posts.repository';

import { BlogsRepository } from './blogs.repository';
import { BlogCreateDto, BlogUpdateDto } from './blogs.dto';
import { BlogCreate } from './blogs.types';

@Injectable()
export class BlogsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async updateBlogById(
    id: string,
    updatedBlog: BlogUpdateDto,
  ): Promise<boolean> {
    const blog = await this.blogsRepository.updateById(id, updatedBlog);

    if (!blog) {
      return !!blog;
    }

    if (blog.name !== updatedBlog.name) {
      await this.postsRepository.updateByBlogId(id, updatedBlog.name);
    }

    return !!blog;
  }

  async createBlog({
    name,
    websiteUrl,
    description,
  }: BlogCreateDto): Promise<{ id: string }> {
    const id = new Date().getTime().toString();

    const createdBlog: BlogCreate = {
      id,
      name,
      websiteUrl,
      description,
      isMembership: false,
    };

    await this.blogsRepository.create(createdBlog);

    return { id };
  }

  async deleteBlogById(id: string): Promise<boolean> {
    const isDeleted = await this.blogsRepository.deleteById(id);

    if (isDeleted) {
      await this.postsRepository.deleteAllByBlogId(id);
    }

    return isDeleted;
  }
}
