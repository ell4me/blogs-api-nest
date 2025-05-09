import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { UserQueries } from '../../types';
import { ROUTERS_PATH } from '../../constants';
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';
import { PaginationViewDto } from '../../common/dto/pagination-view.dto';

import { UserCreateDto, UserViewDto } from './users.dto';
import {
  CreateUserCommand,
  TExecuteCreateUserResult,
} from './application/use-cases/create-user.useCase';
import {
  DeleteUserByIdCommand,
  TExecuteDeleteUserByIdResult,
} from './application/use-cases/delete-user-by-id.useCase';
import { UsersOrmQueryRepository } from './infrastructure/orm/users.orm-query-repository';

@Controller(ROUTERS_PATH.USERS)
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersOrmQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAllUsers(
    @Query() queries: UserQueries,
  ): Promise<PaginationViewDto<UserViewDto>> {
    return this.usersQueryRepository.getAll(queries);
  }

  @Post()
  async createUser(
    @Body() userCreateDto: UserCreateDto,
  ): Promise<UserViewDto | null> {
    const result = await this.commandBus.execute<
      CreateUserCommand,
      TExecuteCreateUserResult
    >(new CreateUserCommand(userCreateDto));

    return this.usersQueryRepository.getById(result.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUserById(@Param('id') id: string): Promise<boolean> {
    return this.commandBus.execute<
      DeleteUserByIdCommand,
      TExecuteDeleteUserByIdResult
    >(new DeleteUserByIdCommand(id));
  }
}
