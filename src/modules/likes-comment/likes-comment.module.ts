import { Module } from '@nestjs/common';

import { LikesCommentPgRepository } from './infrastructure/likes-comment.pg-repository';
import { UpdateLikeStatusCommentUseCase } from './application/update-like-status-comment.useCase';

@Module({
  providers: [LikesCommentPgRepository, UpdateLikeStatusCommentUseCase],
  exports: [LikesCommentPgRepository, UpdateLikeStatusCommentUseCase],
})
export class LikesCommentModule {}
