import { DeleteResult } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { UserCreateDto } from '../users.dto';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../common/exception/domain-exception';
import { VALIDATION_MESSAGES } from '../../../constants';

import { TUserModel, User, UserDocument } from './users.model';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UsersModel: TUserModel) {}

  async create(
    userCreateDto: UserCreateDto,
    emailConfirmation?: boolean,
  ): Promise<UserDocument> {
    const user = await this.UsersModel.createInstance(
      userCreateDto,
      this.UsersModel,
      emailConfirmation,
    );
    return await user.save();
  }

  async deleteOrNotFoundFail(id: string): Promise<boolean> {
    const result = await this.UsersModel.deleteOne({ id }).exec();

    if (!result.deletedCount) {
      throw NotFoundDomainException.create('create');
    }

    return true;
  }

  deleteAll(): Promise<DeleteResult> {
    return this.UsersModel.deleteMany().exec();
  }

  findByEmailOrLogin({
    email,
    login,
  }: Partial<{
    email: string;
    login: string;
  }>): Promise<UserDocument | null> {
    return this.UsersModel.findOne().or([{ email }, { login }]);
  }

  async getByConfirmationCodeOrBadRequestFail(
    code: string,
  ): Promise<UserDocument> {
    const user = await this.UsersModel.findOne({
      'emailConfirmation.code': code,
    }).exec();

    if (!user) {
      throw BadRequestDomainException.create(
        'code',
        VALIDATION_MESSAGES.CODE_IS_NOT_CORRECT('Confirmation'),
      );
    }

    return user;
  }

  save(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }

  async getUserByPasswordRecoveryCodeOrBadRequestFail(
    code: string,
  ): Promise<UserDocument> {
    const user = await this.UsersModel.findOne({
      'passwordRecovery.code': code,
    });

    if (!user) {
      throw BadRequestDomainException.create(
        'recoveryCode',
        VALIDATION_MESSAGES.CODE_IS_NOT_CORRECT('Recovery'),
      );
    }

    return user;
  }
}
