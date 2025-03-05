import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LikesCommentPgRepository } from './infrastructure/pg/likes-comment.pg-repository';
import { UpdateLikeStatusCommentUseCase } from './application/update-like-status-comment.useCase';
import { LikesCommentOrmRepository } from './infrastructure/orm/likes-comment.orm-repository';
import { LikesComment } from './infrastructure/orm/like-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LikesComment])],
  providers: [
    LikesCommentPgRepository,
    LikesCommentOrmRepository,
    UpdateLikeStatusCommentUseCase,
  ],
  exports: [
    LikesCommentPgRepository,
    LikesCommentOrmRepository,
    UpdateLikeStatusCommentUseCase,
  ],
})
export class LikesCommentModule {}
