import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';

import { PostsController } from './posts.controller';
import { Post, PostsSchema } from './posts.model';
import { PostsQueryRepository } from './posts.query-repository';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';

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
