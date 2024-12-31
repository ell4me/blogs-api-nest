import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PostsModule } from '../posts/posts.module';

import { BlogsController } from './blogs.controller';
import { BlogsQueryRepository } from './blogs.query-repository';
import { BlogsRepository } from './blogs.repository';
import { BlogsService } from './blogs.service';
import { Blog, BlogsSchema } from './blogs.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogsSchema }]),
    forwardRef(() => PostsModule),
  ],
  controllers: [BlogsController],
  providers: [BlogsQueryRepository, BlogsRepository, BlogsService],
  exports: [BlogsQueryRepository, BlogsRepository],
})
export class BlogsModule {}
