import { DeleteResult } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { UserCreateDto } from '../users.dto';

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

  async deleteById(id: string): Promise<boolean> {
    const result = await this.UsersModel.deleteOne({ id }).exec();

    return result.deletedCount === 1;
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

  getByConfirmationCode(code: string): Promise<UserDocument | null> {
    return this.UsersModel.findOne({ 'emailConfirmation.code': code }).exec();
  }

  save(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }

  getUserByPasswordRecoveryCode(code: string): Promise<UserDocument | null> {
    return this.UsersModel.findOne({ 'passwordRecovery.code': code });
  }
}
