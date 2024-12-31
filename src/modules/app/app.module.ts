import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { SETTINGS } from '../../constants';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import { BlogsModule } from '../blogs/blogs.module';
import { TestingController } from '../testing/testing.controller';
import { CommentsModule } from '../comments/comments.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(SETTINGS.DB_HOST, {
      auth: {
        username: SETTINGS.DB_USER,
        password: SETTINGS.DB_PASS,
      },
      dbName: SETTINGS.DB_NAME,
    }),
    UsersModule,
    PostsModule,
    BlogsModule,
    CommentsModule,
  ],
  controllers: [AppController, TestingController],
  providers: [AppService],
})
export class AppModule {}
