import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  UserQueries,
  ItemsPaginationViewDto,
  TSortDirection,
} from '../../../../types';
import { UserViewDto } from '../../users.dto';
import { CurrentUserViewDto } from '../../../../common/dto/currentUserView.dto';

import { User } from './user.entity';
import { IUsersQueryRepository } from './interfaces';

@Injectable()
export class UsersOrmQueryRepository implements IUsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getAll({
    pageSize,
    pageNumber,
    sortBy,
    sortDirection,
    searchLoginTerm,
    searchEmailTerm,
  }: UserQueries): Promise<ItemsPaginationViewDto<UserViewDto>> {
    const offset = (pageNumber - 1) * pageSize;

    const builder = this.usersRepository
      .createQueryBuilder('u')
      .orderBy(
        `"${sortBy}"`,
        String(sortDirection).toUpperCase() as TSortDirection,
      )
      .limit(pageSize)
      .offset(offset);

    if (searchLoginTerm) {
      builder.orWhere('u.login ILIKE :searchLoginTerm', {
        searchLoginTerm: `%${searchLoginTerm}%`,
      });
    }

    if (searchEmailTerm) {
      builder.orWhere('u.email ILIKE :searchEmailTerm', {
        searchEmailTerm: `%${searchEmailTerm}%`,
      });
    }

    const users = await builder.getMany();

    const totalCount = await this.getCountUsersByFilter(
      searchLoginTerm,
      searchEmailTerm,
    );

    return {
      page: pageNumber,
      pagesCount: Math.ceil(totalCount / pageSize),
      pageSize: pageSize,
      totalCount,
      items: users.map((user) => ({
        id: user.id,
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
      })),
    };
  }

  async getById(id: string): Promise<UserViewDto | null> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      return user;
    }

    return {
      id: user.id,
      email: user.email,
      login: user.login,
      createdAt: user.createdAt,
    };
  }

  async getCurrentUser(id: string): Promise<CurrentUserViewDto> {
    const user = await this.usersRepository.findOneBy({ id });

    return {
      email: user!.email,
      login: user!.login,
      userId: user!.id,
    };
  }

  private async getCountUsersByFilter(
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
  ): Promise<number> {
    return this.usersRepository
      .createQueryBuilder('u')
      .where('u.login ILIKE :searchLoginTerm', {
        searchLoginTerm: `%${searchLoginTerm}%`,
      })
      .orWhere('u.email ILIKE :searchEmailTerm', {
        searchEmailTerm: `%${searchEmailTerm}%`,
      })
      .getCount();
  }
}
