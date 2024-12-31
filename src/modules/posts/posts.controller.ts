import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import {
  FilteredBlogQueries,
  ItemsPaginationViewDto,
  PaginationQueries,
  ValidationErrorViewDto,
} from '../../types';
import { ROUTERS_PATH, VALIDATION_MESSAGES } from '../../constants';
import { BlogsQueryRepository } from '../blogs/blogs.query-repository';
import { CommentsQueryRepository } from '../comments/comments.query-repository';

import { PostsQueryRepository } from './posts.query-repository';
import { PostCreateByBlogIdDto, PostUpdateDto, PostViewDto } from './posts.dto';
import { PostsService } from './posts.service';

@Controller(ROUTERS_PATH.POSTS)
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsService: PostsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async getAllPosts(
    @Query() query: FilteredBlogQueries,
  ): Promise<ItemsPaginationViewDto<PostViewDto>> {
    return this.postsQueryRepository.getAllPosts(query);
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.postsQueryRepository.getPostById(id);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  @Post()
  async createPost(
    @Body() newPost: PostCreateByBlogIdDto,
  ): Promise<PostViewDto | null> {
    const blog = await this.blogsQueryRepository.getById(newPost.blogId);

    if (!blog) {
      throw new BadRequestException({
        errorsMessages: [
          {
            field: 'blogId',
            message: VALIDATION_MESSAGES.BLOG_IS_NOT_EXIST,
          },
        ],
      } as ValidationErrorViewDto);
    }

    const { id } = await this.postsService.createPost(newPost, blog.name);
    return await this.postsQueryRepository.getPostById(id);
  }

  @Put(':id')
  async updatePostById(
    @Param('id') id: string,
    @Body() postUpdateDto: PostUpdateDto,
  ): Promise<void> {
    const blog = await this.blogsQueryRepository.getById(postUpdateDto.blogId);

    if (!blog) {
      throw new BadRequestException({
        errorsMessages: [
          {
            field: 'blogId',
            message: VALIDATION_MESSAGES.BLOG_IS_NOT_EXIST,
          },
        ],
      } as ValidationErrorViewDto);
    }

    const isUpdated = await this.postsService.updatePostById(id, postUpdateDto);

    if (!isUpdated) {
      throw new NotFoundException();
    }

    return;
  }

  @Delete()
  async deletePostById(@Param('id') id: string): Promise<void> {
    const isDeleted = await this.postsService.deletePostById(id);

    if (!isDeleted) {
      throw new NotFoundException();
    }

    return;
  }

  @Get(':id/comments')
  async getCommentsByPostId(
    @Query() query: PaginationQueries,
    @Param('id') id: string,
  ) {
    const post = await this.postsQueryRepository.getPostById(id);
    if (!post) {
      throw new NotFoundException();
    }

    return await this.commentsQueryRepository.getCommentsByPostId(id, query);
  }
}
