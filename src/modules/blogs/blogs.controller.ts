import {
  Body,
  Controller,
  DefaultValuePipe,
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
import { SortDirection } from 'mongodb';

import { ItemsPaginationViewDto } from '../../types';
import { PostsQueryRepository } from '../posts/infrastructure/posts.query-repository';
import { PostCreateDto, PostViewDto } from '../posts/posts.dto';
import { PostsService } from '../posts/application/posts.service';
import { ROUTERS_PATH } from '../../constants';

import { BlogsService } from './application/blogs.service';
import { BlogCreateDto, BlogUpdateDto, BlogViewDto } from './blogs.dto';
import { BlogsQueryRepository } from './infrastructure/blogs.query-repository';

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
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe('desc'))
    sortDirection: SortDirection,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1))
    pageNumber: number,
    @Query('searchNameTerm') searchNameTerm: string,
  ): Promise<ItemsPaginationViewDto<BlogViewDto>> {
    return await this.blogsQueryRepository.getAll({
      sortBy,
      pageSize,
      pageNumber,
      sortDirection,
      searchNameTerm,
    });
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<BlogViewDto> {
    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return blog;
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe('desc'))
    sortDirection: SortDirection,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1))
    pageNumber: number,
    @Query('searchNameTerm') searchNameTerm: string,
    @Param('id') id: string,
  ): Promise<ItemsPaginationViewDto<PostViewDto>> {
    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return await this.postsQueryRepository.getAllPosts(
      {
        sortBy,
        pageSize,
        pageNumber,
        sortDirection,
        searchNameTerm,
      },
      {
        blogId: id,
      },
    );
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
