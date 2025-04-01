import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TestingModule } from '../testing/testing.module';
import { CommonConfigModule } from '../../common/config/common-config.module';
import { CommonConfig } from '../../common/config/common.config';

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
