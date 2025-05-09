import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { UserQueries } from '../../../../types';
import { CurrentUserViewDto } from '../../../../common/dto/current-user-view.dto';
import { getUsersFilterRepository } from '../../helpers/getUsersFilterRepository';
import { UserViewDto } from '../../users.dto';
import { PaginationViewDto } from '../../../../common/dto/pagination-view.dto';

import { TUserModel, User } from './users.model';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private readonly UsersModel: TUserModel,
  ) {}

  async getAll({
    pageSize,
    pageNumber,
    sortBy,
    sortDirection,
    searchLoginTerm,
    searchEmailTerm,
  }: UserQueries): Promise<PaginationViewDto<UserViewDto>> {
    const filterOr = getUsersFilterRepository(searchLoginTerm, searchEmailTerm);
    const users = await this.UsersModel.find()
      .or(filterOr)
      .skip((pageNumber - 1) * pageSize)
      .sort({ [sortBy]: sortDirection })
      .limit(pageSize)
      .select(
        '-_id -__v -updatedAt -password -emailConfirmation -passwordRecovery',
      )
      .exec();

    const totalCount = await this.getCountUsersByFilter(
      searchLoginTerm,
      searchEmailTerm,
    );

    return {
      page: pageNumber,
      pagesCount: Math.ceil(totalCount / pageSize),
      pageSize: pageSize,
      totalCount,
      items: users,
    };
  }

  getById(id: string): Promise<UserViewDto | null> {
    return this.UsersModel.findOne({ id })
      .select(
        '-_id -__v -updatedAt -password -emailConfirmation -passwordRecovery',
      )
      .exec();
  }

  getCountUsersByFilter(
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
  ): Promise<number> {
    const filterOr = getUsersFilterRepository(searchLoginTerm, searchEmailTerm);
    return this.UsersModel.countDocuments().or(filterOr).exec();
  }

  async getCurrentUser(id: string): Promise<CurrentUserViewDto> {
    const user = await this.UsersModel.findOne({ id }).exec();

    return {
      email: user!.email,
      login: user!.login,
      userId: user!.id,
    };
  }
}
