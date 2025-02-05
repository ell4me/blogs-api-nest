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
import { BlogsPgQueryRepository } from '../blogs/infrastructure/blogs.pg-query-repository';

import { PostCreateByBlogIdDto, PostViewDto } from './posts.dto';
import {
  CreatePostCommand,
  TExecuteCreatePost,
} from './application/use-cases/create-post.useCase';
import {
  DeletePostCommand,
  TExecuteDeletePost,
} from './application/use-cases/delete-post.useCase';
import { PostsPgQueryRepository } from './infrastructure/posts.pg-query-repository';

@Controller(ROUTERS_PATH.POSTS)
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsPgQueryRepository,
    private readonly blogsQueryRepository: BlogsPgQueryRepository,
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
    return this.postsQueryRepository.getAll(queries, userId);
  }

  @Public()
  @UseGuards(AccessTokenGuard)
  @Get(':id')
  async getPostById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const post = await this.postsQueryRepository.getById(id, userId);

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
    >(new CreatePostCommand(newPost));

    return await this.postsQueryRepository.getById(id);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePostById(@Param('id') id: string): Promise<void> {
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
    const post = await this.postsQueryRepository.getById(postId);
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
    const post = await this.postsQueryRepository.getById(postId);
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
    const post = await this.postsQueryRepository.getById(postId);

    if (!post) {
      throw new NotFoundException();
    }

    return this.commandBus.execute<
      UpdateLikeStatusPostCommand,
      TExecuteUpdateLikeStatusPost
    >(new UpdateLikeStatusPostCommand(postId, userId, likesPostUpdateDto));
  }
}
