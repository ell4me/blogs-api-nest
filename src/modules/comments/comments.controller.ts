import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ROUTERS_PATH } from '../../constants';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { CommentsQueryRepository } from './infrastructure/comments.query-repository';
import {
  CommentLikeDto,
  CommentUpdateDto,
  CommentViewDto,
} from './comments.dto';
import {
  TExecuteUpdateComment,
  UpdateCommentCommand,
} from './application/use-cases/update-comment.useCase';
import {
  LikeCommentCommand,
  TExecuteLikeComment,
} from './application/use-cases/like-comment.useCase';
import {
  DeleteCommentCommand,
  TExecuteDeleteComment,
} from './application/use-cases/delete-comment.useCase';

@Controller(ROUTERS_PATH.COMMENTS)
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':id')
  async getCommentById(@Param('id') id: string): Promise<CommentViewDto> {
    const comment = await this.commentsQueryRepository.getCommentById(id);

    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':commentId')
  async updateCommentById(
    @Param('commentId') commentId: string,
    @Body() commentUpdateDto: CommentUpdateDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.commandBus.execute<UpdateCommentCommand, TExecuteUpdateComment>(
      new UpdateCommentCommand(commentId, commentUpdateDto, userId),
    );

    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':commentId/like-status')
  async likeCommentById(
    @Param('commentId') commentId: string,
    @Body() commentLikeDto: CommentLikeDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      userId,
    );

    if (!comment) {
      throw new NotFoundException();
    }

    await this.commandBus.execute<LikeCommentCommand, TExecuteLikeComment>(
      new LikeCommentCommand(
        comment.likesInfo.myStatus,
        commentId,
        userId,
        commentLikeDto,
      ),
    );

    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':commentId')
  async deleteCommentById(
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.commandBus.execute<DeleteCommentCommand, TExecuteDeleteComment>(
      new DeleteCommentCommand(commentId, userId),
    );

    return;
  }
}
