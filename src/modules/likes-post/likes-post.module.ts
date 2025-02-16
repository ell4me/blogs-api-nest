import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';

import {
  LikesPost,
  LikesPostSchema,
} from './infrastructure/mongo/likes-post.model';
import { LikesPostQueryRepository } from './infrastructure/mongo/likes-post.query-repository';
import { LikesPostRepository } from './infrastructure/mongo/likes-post.repository';
import { UpdateLikeStatusPostUseCase } from './application/use-cases/update-like-status-post.useCase';
import { LikesPostPgRepository } from './infrastructure/pg/likes-post.pg-repository';
import { LikesPostPgQueryRepository } from './infrastructure/pg/likes-post.pg-query-repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LikesPost.name, schema: LikesPostSchema },
    ]),
    UsersModule,
  ],
  providers: [
    LikesPostRepository,
    LikesPostQueryRepository,
    LikesPostPgRepository,
    LikesPostPgQueryRepository,
    UpdateLikeStatusPostUseCase,
  ],
  exports: [
    LikesPostRepository,
    LikesPostQueryRepository,
    LikesPostPgRepository,
    LikesPostPgQueryRepository,
    UpdateLikeStatusPostUseCase,
  ],
})
export class LikesPostModule {}
