import {
  BadRequestException,
  Body,
  Controller,
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

import { FilteredUserQueries, ItemsPaginationViewDto } from '../../types';
import { ROUTERS_PATH } from '../../constants';
import { BasicAuthGuard } from '../../guards/basic-auth.guard';

import { UsersQueryRepository } from './users.query-repository';
import { UserCreateDto, UserViewDto } from './users.dto';
import { UsersService } from './users.service';

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
    @Query() query: FilteredUserQueries,
  ): Promise<ItemsPaginationViewDto<UserViewDto>> {
    return this.usersQueryRepository.getAll(query);
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
