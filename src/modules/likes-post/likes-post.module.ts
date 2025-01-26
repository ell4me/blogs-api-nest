import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';

import { LikesPost, LikesPostSchema } from './infrastructure/likes-post.model';
import { LikesPostQueryRepository } from './infrastructure/likes-post.query-repository';
import { LikesPostRepository } from './infrastructure/likes-post.repository';
import { UpdateLikeStatusPostUseCase } from './application/use-cases/update-like-status-post.useCase';

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
    UpdateLikeStatusPostUseCase,
  ],
  exports: [
    LikesPostRepository,
    LikesPostQueryRepository,
    UpdateLikeStatusPostUseCase,
  ],
})
export class LikesPostModule {}
