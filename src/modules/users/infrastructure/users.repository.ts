import { DeleteResult } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { UserCreateDto } from '../users.dto';
import {
  BadRequestDomainException,
  NotFoundDomainException,
  UnauthorizedDomainException,
} from '../../../common/exception/domain-exception';
import { VALIDATION_MESSAGES } from '../../../constants';

import { TUserModel, User, UserDocument } from './users.model';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly UsersModel: TUserModel,
  ) {}

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
      throw NotFoundDomainException.create();
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

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.UsersModel.findOne({ id });

    if (!user) {
      throw NotFoundDomainException.create();
    }

    return user;
  }

  async findOrUnauthorizedFail(id: string): Promise<UserDocument> {
    const user = await this.UsersModel.findOne({ id });

    if (!user) {
      throw UnauthorizedDomainException.create();
    }

    return user;
  }

  async findByConfirmationCodeOrBadRequestFail(
    code: string,
  ): Promise<UserDocument> {
    const user = await this.UsersModel.findOne({
      'emailConfirmation.code': code,
    }).exec();

    if (!user) {
      throw BadRequestDomainException.create(
        VALIDATION_MESSAGES.CODE_IS_NOT_CORRECT('Confirmation'),
        'code',
      );
    }

    return user;
  }

  save(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }

  async findByPasswordRecoveryCodeOrBadRequestFail(
    code: string,
  ): Promise<UserDocument> {
    const user = await this.UsersModel.findOne({
      'passwordRecovery.code': code,
    });

    if (!user) {
      throw BadRequestDomainException.create(
        VALIDATION_MESSAGES.CODE_IS_NOT_CORRECT('Recovery'),
        'recoveryCode',
      );
    }

    return user;
  }
}
