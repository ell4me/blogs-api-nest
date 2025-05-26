import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';
import { AuthModule } from '../auth/auth.module';
import { TestingModule } from '../testing/testing.module';
import { CommonConfigModule } from '../../common/config/common-config.module';
import { CommonConfig } from '../../common/config/common.config';
import { LikesPostModule } from '../likes-post/likes-post.module';
import { SecurityDevicesModule } from '../security-devices/security-devices.module';
import { LikesCommentModule } from '../likes-comment/likes-comment.module';
import { QuizQuestionsModule } from '../quiz-game/quiz-questions/quiz-questions.module';
import { PairsQuizQuestionModule } from '../quiz-game/pairs-quiz-question/pairs-quiz-question.module';
import { PairsQuizAnswerModule } from '../quiz-game/pairs-quiz-answer/pairs-quiz-answer.module';
import { PairsQuizModule } from '../quiz-game/pairs-quiz/pairs-quiz.module';
import { MetricsModule } from '../../metrics/metrics.module';
import { CounterInterceptor } from '../../common/interceptors/counter.interceptor';

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
        retryAttempts: 5,
        retryDelay: 3000,
      }),
      inject: [CommonConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [CommonConfigModule],
      useFactory: (config: CommonConfig) => {
        const ormConfig =
          config.nodeEnv === 'production'
            ? {
                url: config.pgUrl,
              }
            : {
                host: config.pgHost,
                port: config.pgPort,
                username: config.pgUser,
                password: config.pgPassword,
                database: config.pgDb,
              };

        return {
          type: 'postgres',
          synchronize: true,
          autoLoadEntities: true,
          ...ormConfig,
        };
      },
      inject: [CommonConfig],
    }),
    ThrottlerModule.forRootAsync({
      imports: [CommonConfigModule],
      useFactory: (config: CommonConfig) => [
        {
          ttl: seconds(config.ttlRateLimit),
          limit: config.numberRateLimit,
        },
      ],
      inject: [CommonConfig],
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [CommonConfigModule],
      driver: ApolloDriver,
      useFactory: (config: CommonConfig) => ({
        autoSchemaFile: true,
        sortSchema: true,
        playground: false,
        plugins: [
          config.nodeEnv === 'production'
            ? ApolloServerPluginLandingPageProductionDefault()
            : ApolloServerPluginLandingPageLocalDefault(),
        ],
      }),
      inject: [CommonConfig],
    }),
    MetricsModule,
    UsersModule,
    LikesPostModule,
    PostsModule,
    BlogsModule,
    CommentsModule,
    AuthModule,
    SecurityDevicesModule,
    LikesCommentModule,
    PairsQuizModule,
    QuizQuestionsModule,
    PairsQuizQuestionModule,
    PairsQuizAnswerModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CounterInterceptor,
    },
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
