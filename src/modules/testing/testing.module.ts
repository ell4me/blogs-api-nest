import { Module } from '@nestjs/common';

import { BlogsModule } from '../blogs/blogs.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { CommentsModule } from '../comments/comments.module';
import { LikesPostModule } from '../likes-post/likes-post.module';
import { SecurityDevicesModule } from '../security-devices/security-devices.module';
import { LikesCommentModule } from '../likes-comment/likes-comment.module';

import { TestingController } from './testing.controller';

@Module({
  imports: [
    BlogsModule,
    PostsModule,
    UsersModule,
    CommentsModule,
    LikesPostModule,
    SecurityDevicesModule,
    LikesCommentModule,
  ],
  controllers: [TestingController],
})
export class TestingModule {}
