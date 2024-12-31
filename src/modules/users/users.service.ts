import { Injectable } from '@nestjs/common';

import { ValidationErrorViewDto } from '../../types';

import { UsersRepository } from './users.repository';
import { UserCreateDto } from './users.dto';
import { validateUserIsExist } from './helpers/validateUserIsExist';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(
    userCreateDto: UserCreateDto,
  ): Promise<{ id: string } | ValidationErrorViewDto> {
    const user = await this.usersRepository.getByEmailOrLogin({
      email: userCreateDto.email,
      login: userCreateDto.login,
    });

    if (user) {
      return validateUserIsExist(user, userCreateDto.email);
    }

    const createdUser = await this.usersRepository.create(userCreateDto);

    return { id: createdUser.id };
  }

  deleteUserById(id: string): Promise<boolean> {
    return this.usersRepository.deleteById(id);
  }
}
