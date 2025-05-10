import {
  Body,
  Controller,
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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PostQueries, CommentQueries } from '../../../types';
import { ROUTERS_PATH } from '../../../constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenGuard } from '../../../common/guards/access-token.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { LikesPostUpdateDto } from '../../likes-post/likes-post.dto';
import {
  TExecuteUpdateLikeStatusPost,
  UpdateLikeStatusPostCommand,
} from '../../likes-post/application/use-cases/update-like-status-post.useCase';
import { CommentsOrmQueryRepository } from '../../comments/infrastructure/orm/comments.orm-query-repository';
import { CommentCreateDto, CommentViewDto } from '../../comments/comments.dto';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment.useCase';
import { PaginationViewDto } from '../../../common/dto/pagination-view.dto';
import { ApiPaginatedResponse } from '../../../common/helpers/api-paginated-response';
import { ValidationErrorViewDto } from '../../../common/dto/validation-error-view.dto';
import { PostsOrmQueryRepository } from '../infrastructure/orm/posts.orm-query-repository';

import { PostViewDto } from './posts.dto';

@Controller(ROUTERS_PATH.POSTS)
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsOrmQueryRepository,
    private readonly commentsQueryRepository: CommentsOrmQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiPaginatedResponse(PostViewDto)
  @Public()
  @UseGuards(AccessTokenGuard)
  @Get()
  async getAllPosts(
    @Query() queries: PostQueries,
    @CurrentUser('id') userId: string,
  ): Promise<PaginationViewDto<PostViewDto>> {
    return this.postsQueryRepository.getAll(queries, userId);
  }

  @ApiOkResponse({ type: PostViewDto })
  @ApiNotFoundResponse({ description: 'Not found' })
  @Public()
  @UseGuards(AccessTokenGuard)
  @Get(':id')
  async getPostById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<PostViewDto> {
    const post = await this.postsQueryRepository.getById({
      postId: id,
      userId,
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  @ApiPaginatedResponse(CommentViewDto)
  @ApiNotFoundResponse({
    description: "If post for passed postId doesn't exist",
  })
  @Public()
  @UseGuards(AccessTokenGuard)
  @Get(':postId/comments')
  async getCommentsByPostId(
    @Query() queries: CommentQueries,
    @CurrentUser('id') userId: string,
    @Param('postId') postId: string,
  ): Promise<PaginationViewDto<CommentViewDto>> {
    const post = await this.postsQueryRepository.getById({ postId });
    if (!post) {
      throw new NotFoundException();
    }

    return await this.commentsQueryRepository.getCommentsByPostId(
      postId,
      queries,
      userId,
    );
  }

  @ApiCreatedResponse({ type: CommentViewDto })
  @ApiNotFoundResponse({
    description: "If post for passed postId doesn't exist",
  })
  @ApiBadRequestResponse({
    type: ValidationErrorViewDto,
    description: 'If the inputModel has incorrect values',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post(':postId/comments')
  async createComment(
    @Body() commentCreateDto: CommentCreateDto,
    @CurrentUser('id') userId: string,
    @Param('postId') postId: string,
  ): Promise<CommentViewDto> {
    const post = await this.postsQueryRepository.getById({ postId });
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

  @ApiBadRequestResponse({
    type: ValidationErrorViewDto,
    description: 'If the inputModel has incorrect values',
  })
  @ApiNotFoundResponse({
    description: "If post for passed postId doesn't exist",
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likePostById(
    @Body() likesPostUpdateDto: LikesPostUpdateDto,
    @CurrentUser('id') userId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    const post = await this.postsQueryRepository.getById({ postId, userId });

    if (!post) {
      throw new NotFoundException();
    }

    return this.commandBus.execute<
      UpdateLikeStatusPostCommand,
      TExecuteUpdateLikeStatusPost
    >(
      new UpdateLikeStatusPostCommand(
        postId,
        userId,
        likesPostUpdateDto,
        post.extendedLikesInfo.myStatus,
      ),
    );
  }
}
