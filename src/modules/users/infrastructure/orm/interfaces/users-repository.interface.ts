import { UserCreateDto } from '../../../users.dto';
import { User } from '../user.entity';

export type TFindByEmailOrLoginArgs = Partial<{
  email: string;
  login: string;
}>;

export interface IUsersRepository {
  findOrNotFoundFail(id: string): Promise<User>;

  findByEmailOrLogin(
    emailOrLogin: TFindByEmailOrLoginArgs,
  ): Promise<User | null>;

  create(
    userCreateDto: UserCreateDto,
    emailConfirmation?: boolean,
  ): Promise<User>;

  deleteOrNotFoundFail(id: string): Promise<boolean>;

  findByConfirmationCodeOrBadRequestFail(code: string): Promise<User>;

  save(user: User): Promise<User>;

  findByPasswordRecoveryCodeOrBadRequestFail(code: string): Promise<User>;

  deleteAll(): Promise<any>;
}
