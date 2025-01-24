import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';
import { AuthModule } from '../auth/auth.module';
import { TestingModule } from '../testing/testing.module';
import { CommonConfigModule } from '../../common/config/common-config.module';
import { CommonConfig } from '../../common/config/common.config';
import { LikesPostModule } from '../likesPost/likesPost.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CqrsModule.forRoot(),
    CommonConfigModule,
    MongooseModule.forRootAsync({
      imports: [CommonConfigModule],
      useFactory: (config: CommonConfig) => ({
        uri: config.dbHost,
        auth: {
          username: config.dbUser,
          password: config.dbPass,
        },
        dbName: config.dbName,
      }),
      inject: [CommonConfig],
    }),
    UsersModule,
    LikesPostModule,
    PostsModule,
    BlogsModule,
    CommentsModule,
    AuthModule,
  ],
})
export class AppModule {
  static async forRoot(commonConfig: CommonConfig): Promise<DynamicModule> {
    // Такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
    // Чтобы не обращаться в декораторе(@Module) к переменной окружения через process.env, потому что
    // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS
    const additionalModules: any[] = [];
    if (commonConfig.includeTestingModule) {
      additionalModules.push(TestingModule);
    }

    return {
      module: AppModule,
      imports: additionalModules, // Add dynamic modules here
    };
  }
}
