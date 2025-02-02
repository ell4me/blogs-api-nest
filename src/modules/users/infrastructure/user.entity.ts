import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';

import { UserCreateDto } from '../users.dto';
import {
  DateTimestamp,
  TEntityWithoutDate,
} from '../../../common/helpers/date-timestamp';

export class UserEntity extends DateTimestamp {
  id: string;
  login: string;
  email: string;
  password: string;
  isConfirmed: boolean;
  passwordRecoveryCode: string | null;
  passwordRecoveryExpiration: number | null;
  emailConfirmationExpiration: number | null;
  emailConfirmationCode: string | null;

  static async createInstance(
    { login, password, email }: UserCreateDto,
    emailConfirmation?: boolean,
  ): Promise<TEntityWithoutDate<UserEntity>> {
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
