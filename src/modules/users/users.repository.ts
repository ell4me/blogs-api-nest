import { DeleteResult } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { TUserModel, User, UserDocument } from './users.model';
import { UserCreateDto } from './users.dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UsersModel: TUserModel) {}

  async create(userCreateDto: UserCreateDto): Promise<UserDocument> {
    const user = await this.UsersModel.createInstance(
      userCreateDto,
      this.UsersModel,
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

  getByEmailOrLogin({
    email,
    login,
  }: Partial<{
    email: string;
    login: string;
  }>): Promise<UserDocument | null> {
    return this.UsersModel.findOne().or([{ email }, { login }]);
  }
}
