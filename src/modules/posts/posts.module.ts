import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentsModule } from '../comments/comments.module';
import { LikesPostModule } from '../likes-post/likes-post.module';

import { PostsController } from './posts.controller';
import { Post as PostEntity } from './infrastructure/orm/post.entity';
import { UpdatePostUseCase } from './application/use-cases/update-post.useCase';
import { CreatePostUseCase } from './application/use-cases/create-post.useCase';
import { DeletePostUseCase } from './application/use-cases/delete-post.useCase';
import { PostsPgQueryRepository } from './infrastructure/pg/posts.pg-query-repository';
import { PostsPgRepository } from './infrastructure/pg/posts.pg-repository';
import { PostsOrmQueryRepository } from './infrastructure/orm/posts.orm-query-repository';
import { PostsOrmRepository } from './infrastructure/orm/posts.orm-repository';

const useCases = [UpdatePostUseCase, CreatePostUseCase, DeletePostUseCase];

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]),
    // MongooseModule.forFeature([{ name: Post.name, schema: PostsSchema }]),
    CommentsModule,
    LikesPostModule,
  ],
  controllers: [PostsController],
  providers: [
    // PostsQueryRepository,
    // PostsRepository,
    PostsPgQueryRepository,
    PostsPgRepository,
    PostsOrmRepository,
    PostsOrmQueryRepository,
    ...useCases,
  ],
  exports: [
    // PostsQueryRepository,
    // PostsRepository,
    PostsPgQueryRepository,
    PostsPgRepository,
    PostsOrmRepository,
    PostsOrmQueryRepository,
    ...useCases,
  ],
})
export class PostsModule {}
