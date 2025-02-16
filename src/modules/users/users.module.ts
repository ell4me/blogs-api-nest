import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmailAdapterModule } from '../../common/adapters/email/email-adapter.module';

import { UsersController } from './users.controller';
import { User, UserSchema } from './infrastructure/mongo/users.model';
import { UsersRepository } from './infrastructure/mongo/users.repository';
import { UsersQueryRepository } from './infrastructure/mongo/users.query-repository';
import { CreateUserUseCase } from './application/use-cases/create-user.useCase';
import { DeleteUserByIdUseCase } from './application/use-cases/delete-user-by-id.useCase';
import { UsersPgRepository } from './infrastructure/pg/users.pg-repository';
import { UsersPgQueryRepository } from './infrastructure/pg/users.pg-query-repository';

const useCases = [CreateUserUseCase, DeleteUserByIdUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EmailAdapterModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    UsersQueryRepository,
    UsersPgRepository,
    UsersPgQueryRepository,
    ...useCases,
  ],
  exports: [
    UsersRepository,
    UsersQueryRepository,
    UsersPgRepository,
    UsersPgQueryRepository,
    CreateUserUseCase,
  ],
})
export class UsersModule {}
