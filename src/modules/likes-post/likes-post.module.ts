import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';

import { LikesPost as LikesPostEntity } from './infrastructure/orm/likes-post.entity';
import { UpdateLikeStatusPostUseCase } from './application/use-cases/update-like-status-post.useCase';
import { LikesPostPgRepository } from './infrastructure/pg/likes-post.pg-repository';
import { LikesPostPgQueryRepository } from './infrastructure/pg/likes-post.pg-query-repository';
import { LikesPostOrmRepository } from './infrastructure/orm/likes-post.orm-repository';
import { LikesPostOrmQueryRepository } from './infrastructure/orm/likes-post.orm-query-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([LikesPostEntity]),
    // MongooseModule.forFeature([
    //   { name: LikesPost.name, schema: LikesPostSchema },
    // ]),
    UsersModule,
  ],
  providers: [
    // LikesPostRepository,
    // LikesPostQueryRepository,
    LikesPostPgRepository,
    LikesPostPgQueryRepository,
    LikesPostOrmRepository,
    LikesPostOrmQueryRepository,
    UpdateLikeStatusPostUseCase,
  ],
  exports: [
    // LikesPostRepository,
    // LikesPostQueryRepository,
    LikesPostPgRepository,
    LikesPostPgQueryRepository,
    LikesPostOrmRepository,
    LikesPostOrmQueryRepository,
    UpdateLikeStatusPostUseCase,
  ],
})
export class LikesPostModule {}
