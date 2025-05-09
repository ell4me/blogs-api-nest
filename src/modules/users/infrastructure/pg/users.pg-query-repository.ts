import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { UserQueries } from '../../../../types';
import { UserViewDto } from '../../users.dto';
import { CurrentUserViewDto } from '../../../../common/dto/current-user-view.dto';
import { PaginationViewDto } from '../../../../common/dto/pagination-view.dto';

@Injectable()
export class UsersPgQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getAll({
    pageSize,
    pageNumber,
    sortBy,
    sortDirection,
    searchLoginTerm,
    searchEmailTerm,
  }: UserQueries): Promise<PaginationViewDto<UserViewDto>> {
    const offset = (pageNumber - 1) * pageSize;

    const users = await this.dataSource.query(
      `
      SELECT * FROM "Users"
      WHERE login ilike $1 or email ilike $2
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $3 OFFSET $4
    `,
      [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`, pageSize, offset],
    );

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
    const user = await this.dataSource.query(
      `
      SELECT * FROM "Users"
      WHERE id=$1
    `,
      [id],
    );

    return {
      id: user[0].id,
      email: user[0].email,
      login: user[0].login,
      createdAt: user[0].createdAt,
    };
  }

  async getCurrentUser(id: string): Promise<CurrentUserViewDto> {
    const user = await this.dataSource.query(
      `
      SELECT * FROM "Users"
      WHERE id=$1
    `,
      [id],
    );

    return {
      email: user[0]!.email,
      login: user[0]!.login,
      userId: user[0]!.id,
    };
  }

  private async getCountUsersByFilter(
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
  ): Promise<number> {
    const result = await this.dataSource.query(
      `
      SELECT count(*) FROM "Users"
       WHERE login ilike $1 or email ilike $2
    `,
      [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`],
    );

    return Number(result[0].count);
  }
}
