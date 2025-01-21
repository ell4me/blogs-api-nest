import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';

import { PostsController } from './posts.controller';
import { Post, PostsSchema } from './infrastructure/posts.model';
import { PostsQueryRepository } from './infrastructure/posts.query-repository';
import { PostsRepository } from './infrastructure/posts.repository';
import { UpdatePostUseCase } from './application/use-cases/update-post.useCase';
import { CreatePostUseCase } from './application/use-cases/create-post.useCase';
import { DeletePostUseCase } from './application/use-cases/delete-post.useCase';

const useCases = [UpdatePostUseCase, CreatePostUseCase, DeletePostUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostsSchema }]),
    forwardRef(() => BlogsModule),
    CommentsModule,
  ],
  controllers: [PostsController],
  providers: [PostsQueryRepository, PostsRepository, ...useCases],
  exports: [PostsQueryRepository, PostsRepository, CreatePostUseCase],
})
export class PostsModule {}
