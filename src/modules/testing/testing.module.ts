import { Module } from '@nestjs/common';

import { BlogsModule } from '../blogs/blogs.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { CommentsModule } from '../comments/comments.module';

import { TestingController } from './testing.controller';

@Module({
  imports: [BlogsModule, PostsModule, UsersModule, CommentsModule],
  controllers: [TestingController],
})
export class TestingModule {}
