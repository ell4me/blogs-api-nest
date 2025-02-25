import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UserCreateDto } from '../../users.dto';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../../common/exception/domain-exception';
import { VALIDATION_MESSAGES } from '../../../../constants';

import { User } from './user.entity';
import { IUsersRepository } from './interfaces';
import { TFindByEmailOrLoginArgs } from './interfaces/users-repository.interface';

@Injectable()
export class UsersOrmRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOrNotFoundFail(id: string) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw NotFoundDomainException.create();
    }

    return user;
  }

  async findByEmailOrLogin({ email, login }: TFindByEmailOrLoginArgs) {
    return this.usersRepository.findOne({
      where: [{ email }, { login }],
    });
  }

  async create(userCreateDto: UserCreateDto, emailConfirmation?: boolean) {
    const user = await User.create(userCreateDto, emailConfirmation);
    return this.usersRepository.save(user);
  }

  async deleteOrNotFoundFail(id: string) {
    const { affected } = await this.usersRepository.delete({ id });

    if (!affected) {
      throw NotFoundDomainException.create();
    }

    return true;
  }

  async findByConfirmationCodeOrBadRequestFail(code: string) {
    const user = await this.usersRepository.findOneBy({
      emailConfirmationCode: code,
    });

    if (!user) {
      throw BadRequestDomainException.create(
        VALIDATION_MESSAGES.CODE_IS_NOT_CORRECT('Confirmation'),
        'code',
      );
    }

    return user;
  }

  async save(user: User) {
    await this.usersRepository.save(user);
    return user;
  }

  async findByPasswordRecoveryCodeOrBadRequestFail(code: string) {
    const user = await this.usersRepository.findOneBy({
      passwordRecoveryCode: code,
    });

    if (!user) {
      throw BadRequestDomainException.create(
        VALIDATION_MESSAGES.CODE_IS_NOT_CORRECT('Recovery'),
        'recoveryCode',
      );
    }

    return user;
  }

  deleteAll() {
    return this.usersRepository.delete({});
  }
}
