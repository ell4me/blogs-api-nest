import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import { BlogsModule } from '../blogs/blogs.module';
import { TestingController } from '../testing/testing.controller';
import { CommentsModule } from '../comments/comments.module';
import { AuthModule } from '../auth/auth.module';
import { ENV_NAMES } from '../../env';

import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get(ENV_NAMES.DB_HOST),
        auth: {
          username: config.get(ENV_NAMES.DB_USER),
          password: config.get(ENV_NAMES.DB_PASS),
        },
        dbName: config.get(ENV_NAMES.DB_NAME),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    PostsModule,
    BlogsModule,
    CommentsModule,
    AuthModule,
  ],
  controllers: [AppController, TestingController],
  providers: [AppService],
})
export class AppModule {}
