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
  UseGuards,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CommentCreateDto, CommentViewDto } from '../comments/comments.dto';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { CreateCommentCommand } from '../comments/application/use-cases/create-comment.useCase';
import { Public } from '../../common/decorators/public.decorator';
import { LikesPostUpdateDto } from '../likes-post/likes-post.dto';
import {
  TExecuteUpdateLikeStatusPost,
  UpdateLikeStatusPostCommand,
} from '../likes-post/application/use-cases/update-like-status-post.useCase';
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';

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

  @Public()
  @UseGuards(AccessTokenGuard)
  @Get()
  async getAllPosts(
    @Query() queries: FilteredPostQueries,
    @CurrentUser('id') userId: string,
  ): Promise<ItemsPaginationViewDto<PostViewDto>> {
    return this.postsQueryRepository.getAllPosts(queries, userId);
  }

  @Public()
  @UseGuards(AccessTokenGuard)
  @Get(':id')
  async getPostById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const post = await this.postsQueryRepository.getPostById(id, userId);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  @UseGuards(BasicAuthGuard)
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

  @UseGuards(BasicAuthGuard)
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

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePostById(@Param('id') id: string): Promise<boolean> {
    return this.commandBus.execute<DeletePostCommand, TExecuteDeletePost>(
      new DeletePostCommand(id),
    );
  }

  @Public()
  @UseGuards(AccessTokenGuard)
  @Get(':postId/comments')
  async getCommentsByPostId(
    @Query() queries: PaginationQueries,
    @CurrentUser('id') userId: string,
    @Param('postId') postId: string,
  ) {
    const post = await this.postsQueryRepository.getPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }

    return await this.commentsQueryRepository.getCommentsByPostId(
      postId,
      queries,
      userId,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Post(':postId/comments')
  async createComment(
    @Body() commentCreateDto: CommentCreateDto,
    @CurrentUser('id') userId: string,
    @Param('postId') postId: string,
  ): Promise<CommentViewDto> {
    const post = await this.postsQueryRepository.getPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }

    const { id } = await this.commandBus.execute(
      new CreateCommentCommand(commentCreateDto, postId, userId),
    );

    const comment = await this.commentsQueryRepository.getCommentById(
      id,
      userId,
    );

    return comment!;
  }

  @UseGuards(AccessTokenGuard)
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likePostById(
    @Body() likesPostUpdateDto: LikesPostUpdateDto,
    @CurrentUser('id') userId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    const post = await this.postsQueryRepository.getPostById(postId);

    if (!post) {
      throw new NotFoundException();
    }

    return this.commandBus.execute<
      UpdateLikeStatusPostCommand,
      TExecuteUpdateLikeStatusPost
    >(new UpdateLikeStatusPostCommand(postId, userId, likesPostUpdateDto));
  }
}
