import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostsModule } from '../posts/posts.module';
import { LikesPostModule } from '../likes-post/likes-post.module';

import { BlogsController } from './blogs.controller';
import { BlogsQueryRepository } from './infrastructure/mongo/blogs.query-repository';
import { BlogsRepository } from './infrastructure/mongo/blogs.repository';
import { Blog, BlogsSchema } from './infrastructure/mongo/blogs.model';
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
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogsSchema }]),
    PostsModule,
    LikesPostModule,
  ],
  controllers: [BlogsController],
  providers: [
    BlogsQueryRepository,
    BlogsRepository,
    BlogsPgQueryRepository,
    BlogsPgRepository,
    BlogsOrmRepository,
    BlogsOrmQueryRepository,
    ...useCases,
  ],
  exports: [BlogsRepository, BlogsPgRepository, BlogsOrmRepository],
})
export class BlogsModule {}
