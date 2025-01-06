import { Injectable } from '@nestjs/common';

import { ValidationErrorViewDto } from '../../types';

import { UsersRepository } from './users.repository';
import { UserCreateDto } from './users.dto';
import { UserDocument } from './users.model';
import { validateUserIsExist } from './helpers/validateUserIsExist';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(
    userCreateDto: UserCreateDto,
    emailConfirmation?: boolean,
  ): Promise<UserDocument | ValidationErrorViewDto> {
    const user = await this.usersRepository.getByEmailOrLogin({
      email: userCreateDto.email,
      login: userCreateDto.login,
    });

    if (user) {
      return validateUserIsExist(user, userCreateDto.email);
    }

    return this.usersRepository.create(userCreateDto, emailConfirmation);
  }

  deleteUserById(id: string): Promise<boolean> {
    return this.usersRepository.deleteById(id);
  }

  getUserByEmailOrLogin(
    emailOrLogin: Partial<{
      email: string;
      login: string;
    }>,
  ): Promise<UserDocument | null> {
    return this.usersRepository.getByEmailOrLogin(emailOrLogin);
  }

  getUserByConfirmationCode(code: string): Promise<UserDocument | null> {
    return this.usersRepository.getByConfirmationCode(code);
  }

  updateUserEmailConfirmation(
    user: UserDocument,
    newConfirmationCode?: boolean,
  ): Promise<UserDocument> {
    user.updateEmailConfirmation(newConfirmationCode);
    return this.usersRepository.save(user);
  }

  updateUserPasswordRecovery(
    user: UserDocument,
    newPasswordRecovery?: boolean,
  ): Promise<UserDocument> {
    user.updatePasswordRecovery(newPasswordRecovery);
    return this.usersRepository.save(user);
  }

  updateUserPassword(
    user: UserDocument,
    newPassword: string,
  ): Promise<UserDocument> {
    user.updatePassword(newPassword);
    return this.usersRepository.save(user);
  }

  getUserByPasswordRecoveryCode(code: string): Promise<UserDocument | null> {
    return this.usersRepository.getUserByPasswordRecoveryCode(code);
  }
}
