import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostsModule } from '../posts/posts.module';

import { BlogsController } from './blogs.controller';
import { Blog as BlogEntity } from './infrastructure/orm/blog.entity';
import { DeleteBlogUseCase } from './application/use-cases/delete-blog.useCase';
import { UpdateBlogUseCase } from './application/use-cases/update-blog.useCase';
import { CreateBlogUseCase } from './application/use-cases/create-blog.useCase';
import { BlogsPgQueryRepository } from './infrastructure/pg/blogs.pg-query-repository';
import { BlogsPgRepository } from './infrastructure/pg/blogs.pg-repository';
import { BlogsOrmQueryRepository } from './infrastructure/orm/blogs.orm-query-repository';
import { BlogsOrmRepository } from './infrastructure/orm/blogs.orm-repository';

const useCases = [DeleteBlogUseCase, UpdateBlogUseCase, CreateBlogUseCase];

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogEntity]),
    // MongooseModule.forFeature([{ name: Blog.name, schema: BlogsSchema }]),
    PostsModule,
  ],
  controllers: [BlogsController],
  providers: [
    // BlogsQueryRepository,
    // BlogsRepository,
    BlogsPgQueryRepository,
    BlogsPgRepository,
    BlogsOrmRepository,
    BlogsOrmQueryRepository,
    ...useCases,
  ],
  exports: [
    // BlogsRepository,
    BlogsPgRepository,
    BlogsOrmRepository,
  ],
})
export class BlogsModule {}
