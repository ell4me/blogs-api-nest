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
    const pageSizeToNumber = Number(pageSize);
    const pageNumberToNumber = Number(pageNumber);

    const users = await this.UsersModel.find()
      .or(filterOr)
      .skip((pageNumberToNumber - 1) * pageSizeToNumber)
      .sort({ [sortBy]: sortDirection })
      .limit(Number(pageSizeToNumber))
      .select(
        '-_id -__v -updatedAt -password -emailConfirmation -passwordRecovery',
      )
      .exec();

    const totalCount = await this.getCountUsersByFilter(
      searchLoginTerm,
      searchEmailTerm,
    );

    return {
      page: pageNumberToNumber,
      pagesCount: Math.ceil(totalCount / pageSizeToNumber),
      pageSize: pageSizeToNumber,
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
