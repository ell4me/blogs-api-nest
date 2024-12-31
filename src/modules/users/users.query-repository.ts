import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { FilteredUserQueries, ItemsPaginationViewDto } from '../../types';

import { getUsersFilterRepository } from './helpers/getUsersFilterRepository';
import { UserViewDto } from './users.dto';
import { TUserModel, User } from './users.model';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UsersModel: TUserModel) {}

  async getAll({
    pageSize = 10,
    pageNumber = 1,
    sortBy = 'createdAt',
    sortDirection = 'desc',
    searchLoginTerm,
    searchEmailTerm,
  }: FilteredUserQueries): Promise<ItemsPaginationViewDto<UserViewDto>> {
    const filterOr = getUsersFilterRepository(searchLoginTerm, searchEmailTerm);

    const users = await this.UsersModel.find()
      .or(filterOr)
      .skip((Number(pageNumber) - 1) * Number(pageSize))
      .sort({ [sortBy]: sortDirection })
      .limit(Number(pageSize))
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
      pageSize,
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
}