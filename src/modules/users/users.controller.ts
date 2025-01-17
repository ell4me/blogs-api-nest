import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SortDirection } from 'mongodb';

import { ItemsPaginationViewDto } from '../../types';
import { ROUTERS_PATH } from '../../constants';
import { BasicAuthGuard } from '../../guards/basic-auth.guard';

import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { UserCreateDto, UserViewDto } from './users.dto';
import { UsersService } from './application/users.service';

@Controller(ROUTERS_PATH.USERS)
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    @Inject(UsersQueryRepository)
    private readonly usersQueryRepository: UsersQueryRepository,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  @Get()
  async getAllUsers(
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe('desc'))
    sortDirection: SortDirection,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1))
    pageNumber: number,
    @Query('searchEmailTerm') searchEmailTerm: string,
    @Query('searchLoginTerm') searchLoginTerm: string,
  ): Promise<ItemsPaginationViewDto<UserViewDto>> {
    return this.usersQueryRepository.getAll({
      sortBy,
      pageSize,
      pageNumber,
      sortDirection,
      searchEmailTerm,
      searchLoginTerm,
    });
  }

  @Post()
  async createUser(@Body() body: UserCreateDto): Promise<UserViewDto | null> {
    const result = await this.usersService.createUser(body);

    if ('errorsMessages' in result) {
      throw new BadRequestException(result.errorsMessages);
    }

    return this.usersQueryRepository.getById(result.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserById(@Param('id') id: string): Promise<boolean> {
    const isDeleted = await this.usersService.deleteUserById(id);

    if (!isDeleted) {
      throw new NotFoundException();
    }

    return isDeleted;
  }
}
