import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';

import { UserCreateDto } from '../../users.dto';
import {
  DateTimestamp,
  TEntityWithoutDate,
} from '../../../../common/helpers/date-timestamp';

interface UserEntityInstanceMethods {
  updateEmailConfirmation: (newConfirmationCode?: boolean) => void;
  updatePasswordRecovery: (newPasswordRecovery?: boolean) => void;
  updatePassword: (newPassword: string) => void;
}

type UserEntityWithoutMethods = Omit<
  UserEntity,
  keyof UserEntityInstanceMethods
>;

export class UserEntity extends DateTimestamp {
  private constructor(
    public id: string,
    public login: string,
    public email: string,
    public password: string,
    public isConfirmed: boolean,
    public passwordRecoveryCode: string | null,
    public passwordRecoveryExpiration: number | null,
    public emailConfirmationExpiration: number | null,
    public emailConfirmationCode: string | null,
    public createdAt: string,
    public updatedAt: string,
  ) {
    super(createdAt, updatedAt);
  }

  updateEmailConfirmation(newConfirmationCode?: boolean) {
    if (newConfirmationCode) {
      this.emailConfirmationCode = uuidv4();
      this.emailConfirmationExpiration = add(new Date(), {
        hours: 1,
      }).getTime();
      this.isConfirmed = false;
      return;
    }

    this.isConfirmed = true;
    this.emailConfirmationCode = null;
    this.emailConfirmationExpiration = null;
  }

  updatePasswordRecovery(newPasswordRecovery?: boolean) {
    if (newPasswordRecovery) {
      this.passwordRecoveryCode = uuidv4();
      this.passwordRecoveryExpiration = add(new Date(), { hours: 1 }).getTime();
      return;
    }

    this.passwordRecoveryCode = null;
    this.passwordRecoveryExpiration = null;
  }

  async updatePassword(newPassword: string) {
    this.password = await hash(newPassword, 10);
  }

  static createInstance(user: UserEntityWithoutMethods): UserEntity {
    return new this(
      user.id,
      user.login,
      user.email,
      user.password,
      user.isConfirmed,
      user.passwordRecoveryCode,
      user.passwordRecoveryExpiration,
      user.emailConfirmationExpiration,
      user.emailConfirmationCode,
      user.createdAt,
      user.updatedAt,
    );
  }

  static async createPojo(
    { login, password, email }: UserCreateDto,
    emailConfirmation?: boolean,
  ): Promise<TEntityWithoutDate<UserEntityWithoutMethods>> {
    const id = new Date().getTime().toString();
    const passwordHash = await hash(password, 10);

    return {
      id,
      login,
      email,
      password: passwordHash,
      isConfirmed: !emailConfirmation,
      emailConfirmationCode: emailConfirmation ? uuidv4() : null,
      emailConfirmationExpiration: emailConfirmation
        ? add(new Date(), { hours: 1 }).getTime()
        : null,
      passwordRecoveryCode: null,
      passwordRecoveryExpiration: null,
    };
  }
}
