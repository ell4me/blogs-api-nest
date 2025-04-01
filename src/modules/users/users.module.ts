import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailAdapterModule } from '../../common/adapters/email/email-adapter.module';

import { UsersController } from './users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.useCase';
import { DeleteUserByIdUseCase } from './application/use-cases/delete-user-by-id.useCase';
import { UsersPgRepository } from './infrastructure/pg/users.pg-repository';
import { UsersPgQueryRepository } from './infrastructure/pg/users.pg-query-repository';
import { User as UserEntity } from './infrastructure/orm/user.entity';
import { UsersOrmRepository } from './infrastructure/orm/users.orm-repository';
import { UsersOrmQueryRepository } from './infrastructure/orm/users.orm-query-repository';

const useCases = [CreateUserUseCase, DeleteUserByIdUseCase];

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    // MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EmailAdapterModule,
  ],
  controllers: [UsersController],
  providers: [
    // UsersRepository,
    // UsersQueryRepository,
    UsersPgRepository,
    UsersPgQueryRepository,
    UsersOrmRepository,
    UsersOrmQueryRepository,
    ...useCases,
  ],
  exports: [
    // UsersRepository,
    // UsersQueryRepository,
    UsersPgRepository,
    UsersPgQueryRepository,
    UsersOrmRepository,
    UsersOrmQueryRepository,
    CreateUserUseCase,
  ],
})
export class UsersModule {}
