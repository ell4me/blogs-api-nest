import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PostsModule } from '../posts/posts.module';

import { BlogsController } from './blogs.controller';
import { BlogsQueryRepository } from './infrastructure/blogs.query-repository';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { Blog, BlogsSchema } from './infrastructure/blogs.model';
import { DeleteBlogUseCase } from './application/use-cases/delete-blog.useCase';
import { UpdateBlogUseCase } from './application/use-cases/update-blog.useCase';
import { CreateBlogUseCase } from './application/use-cases/create-blog.useCase';
import { BlogsPgQueryRepository } from './infrastructure/blogs.pg-query-repository';
import { BlogsPgRepository } from './infrastructure/blogs.pg-repository';

const useCases = [DeleteBlogUseCase, UpdateBlogUseCase, CreateBlogUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogsSchema }]),
    PostsModule,
  ],
  controllers: [BlogsController],
  providers: [
    BlogsQueryRepository,
    BlogsRepository,
    BlogsPgQueryRepository,
    BlogsPgRepository,
    ...useCases,
  ],
  exports: [BlogsRepository, BlogsPgRepository],
})
export class BlogsModule {}
