import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';

import { PostsController } from './posts.controller';
import { Post, PostsSchema } from './infrastructure/posts.model';
import { PostsQueryRepository } from './infrastructure/posts.query-repository';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsService } from './application/posts.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostsSchema }]),
    forwardRef(() => BlogsModule),
    CommentsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsQueryRepository, PostsRepository],
  exports: [PostsService, PostsQueryRepository, PostsRepository],
})
export class PostsModule {}
