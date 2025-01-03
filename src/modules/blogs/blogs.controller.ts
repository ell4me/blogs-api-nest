import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { FilteredBlogQueries, ItemsPaginationViewDto } from '../../types';
import { PostsQueryRepository } from '../posts/posts.query-repository';
import { PostCreateDto, PostViewDto } from '../posts/posts.dto';
import { PostsService } from '../posts/posts.service';
import { ROUTERS_PATH } from '../../constants';

import { BlogsService } from './blogs.service';
import { BlogCreateDto, BlogUpdateDto, BlogViewDto } from './blogs.dto';
import { BlogsQueryRepository } from './blogs.query-repository';

@Controller(ROUTERS_PATH.BLOGS)
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: FilteredBlogQueries,
  ): Promise<ItemsPaginationViewDto<BlogViewDto>> {
    return await this.blogsQueryRepository.getAll(query);
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<BlogViewDto> {
    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return blog;
  }

  @Get('id')
  async getPostsByBlogId(
    @Query() query: FilteredBlogQueries,
    @Param('id') id: string,
  ): Promise<ItemsPaginationViewDto<PostViewDto>> {
    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return await this.postsQueryRepository.getAllPosts(query, {
      blogId: id,
    });
  }

  @Post()
  async createBlog(
    @Body() blogCreateDto: BlogCreateDto,
  ): Promise<BlogViewDto | null> {
    const { id } = await this.blogsService.createBlog(blogCreateDto);
    return await this.blogsQueryRepository.getById(id);
  }

  @Post(':blogId/posts')
  async createPostByBlogId(
    @Body() postCreateDto: PostCreateDto,
    @Param('blogId') blogId: string,
  ): Promise<PostViewDto | null> {
    const blog = await this.blogsQueryRepository.getById(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    const { id } = await this.postsService.createPost(
      {
        ...postCreateDto,
        blogId,
      },
      blog.name,
    );

    return await this.postsQueryRepository.getPostById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlogById(
    @Body() blogUpdateDto: BlogUpdateDto,
    @Param('id') id: string,
  ): Promise<void> {
    const isUpdated = await this.blogsService.updateBlogById(id, blogUpdateDto);

    if (!isUpdated) {
      throw new NotFoundException();
    }

    return;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param('id') id: string) {
    const isDeleted = await this.blogsService.deleteBlogById(id);

    if (!isDeleted) {
      throw new NotFoundException();
    }

    return;
  }
}
