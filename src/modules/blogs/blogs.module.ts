import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PostsModule } from '../posts/posts.module';

import { BlogsController } from './blogs.controller';
import { BlogsQueryRepository } from './infrastructure/mongo/blogs.query-repository';
import { BlogsRepository } from './infrastructure/mongo/blogs.repository';
import { Blog, BlogsSchema } from './infrastructure/mongo/blogs.model';
import { DeleteBlogUseCase } from './application/use-cases/delete-blog.useCase';
import { UpdateBlogUseCase } from './application/use-cases/update-blog.useCase';
import { CreateBlogUseCase } from './application/use-cases/create-blog.useCase';
import { BlogsPgQueryRepository } from './infrastructure/pg/blogs.pg-query-repository';
import { BlogsPgRepository } from './infrastructure/pg/blogs.pg-repository';

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
