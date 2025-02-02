import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { UserCreateDto } from '../users.dto';
import { NotFoundDomainException } from '../../../common/exception/domain-exception';

import { UserEntity } from './user.entity';

@Injectable()
export class UsersPgRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findByEmailOrLogin({
    email,
    login,
  }: Partial<{
    email: string;
    login: string;
  }>): Promise<UserEntity> {
    const result = await this.dataSource.query(
      `
        SELECT * FROM "Users" 
        WHERE login=$1 or email=$2
    `,
      [login, email],
    );

    return result[0];
  }

  async create(userCreateDto: UserCreateDto, emailConfirmation?: boolean) {
    const user = await UserEntity.createInstance(
      userCreateDto,
      emailConfirmation,
    );

    await this.dataSource.query(
      `
      INSERT INTO public."Users" 
      ("id", "login", "email", "password", "isConfirmed", "emailConfirmationCode", "emailConfirmationExpiration")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [
        user.id,
        user.login,
        user.email,
        user.password,
        user.isConfirmed,
        user.emailConfirmationCode,
        user.emailConfirmationExpiration,
      ],
    );

    return user;
  }

  async deleteOrNotFoundFail(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Users" WHERE id=$1`,
      [id],
    );

    if (!result[1]) {
      throw NotFoundDomainException.create();
    }

    return true;
  }
}
