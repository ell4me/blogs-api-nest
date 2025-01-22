import {
  BadRequestException,
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
import { CommandBus } from '@nestjs/cqrs';

import {
  FilteredPostQueries,
  ItemsPaginationViewDto,
  PaginationQueries,
} from '../../types';
import { ROUTERS_PATH, VALIDATION_MESSAGES } from '../../constants';
import { BlogsQueryRepository } from '../blogs/infrastructure/blogs.query-repository';
import { CommentsQueryRepository } from '../comments/infrastructure/comments.query-repository';
import { getErrorMessage } from '../../common/helpers/getErrorMessage';

import { PostsQueryRepository } from './infrastructure/posts.query-repository';
import { PostCreateByBlogIdDto, PostUpdateDto, PostViewDto } from './posts.dto';
import {
  TExecuteUpdatePostById,
  UpdatePostByIdCommand,
} from './application/use-cases/update-post.useCase';
import {
  CreatePostCommand,
  TExecuteCreatePost,
} from './application/use-cases/create-post.useCase';
import {
  DeletePostCommand,
  TExecuteDeletePost,
} from './application/use-cases/delete-post.useCase';

@Controller(ROUTERS_PATH.POSTS)
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAllPosts(
    @Query() queries: FilteredPostQueries,
  ): Promise<ItemsPaginationViewDto<PostViewDto>> {
    return this.postsQueryRepository.getAllPosts(queries);
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
      throw new BadRequestException(
        getErrorMessage('blogId', VALIDATION_MESSAGES.BLOG_IS_NOT_EXIST),
      );
    }

    const { id } = await this.commandBus.execute<
      CreatePostCommand,
      TExecuteCreatePost
    >(new CreatePostCommand(newPost, blog.name));

    return await this.postsQueryRepository.getPostById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostById(
    @Param('id') id: string,
    @Body() postUpdateDto: PostUpdateDto,
  ): Promise<boolean> {
    const blog = await this.blogsQueryRepository.getById(postUpdateDto.blogId);

    if (!blog) {
      throw new BadRequestException(
        getErrorMessage('blogId', VALIDATION_MESSAGES.BLOG_IS_NOT_EXIST),
      );
    }

    return this.commandBus.execute<
      UpdatePostByIdCommand,
      TExecuteUpdatePostById
    >(new UpdatePostByIdCommand(id, postUpdateDto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePostById(@Param('id') id: string): Promise<boolean> {
    return this.commandBus.execute<DeletePostCommand, TExecuteDeletePost>(
      new DeletePostCommand(id),
    );
  }

  @Get(':id/comments')
  async getCommentsByPostId(
    @Query() queries: PaginationQueries,
    @Param('id') id: string,
  ) {
    const post = await this.postsQueryRepository.getPostById(id);
    if (!post) {
      throw new NotFoundException();
    }

    return await this.commentsQueryRepository.getCommentsByPostId(id, queries);
  }
}
