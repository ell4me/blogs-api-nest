import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';

import {
  LikesPost,
  LikesPostSchema,
} from './infrastructure/mongo/likes-post.model';
import { LikesPost as LikesPostEntity } from './infrastructure/orm/likes-post.entity';
import { LikesPostQueryRepository } from './infrastructure/mongo/likes-post.query-repository';
import { LikesPostRepository } from './infrastructure/mongo/likes-post.repository';
import { UpdateLikeStatusPostUseCase } from './application/use-cases/update-like-status-post.useCase';
import { LikesPostPgRepository } from './infrastructure/pg/likes-post.pg-repository';
import { LikesPostPgQueryRepository } from './infrastructure/pg/likes-post.pg-query-repository';
import { LikesPostOrmRepository } from './infrastructure/orm/likes-post.orm-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([LikesPostEntity]),
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
    LikesPostOrmRepository,
    UpdateLikeStatusPostUseCase,
  ],
  exports: [
    LikesPostRepository,
    LikesPostQueryRepository,
    LikesPostPgRepository,
    LikesPostPgQueryRepository,
    LikesPostOrmRepository,
    UpdateLikeStatusPostUseCase,
  ],
})
export class LikesPostModule {}
