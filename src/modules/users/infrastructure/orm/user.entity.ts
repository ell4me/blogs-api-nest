import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';
import { hash } from 'bcryptjs';

import { DateTimestampEntity } from '../../../../common/helpers/date-timestamp';
import { UserCreateDto } from '../../users.dto';
import { SecurityDevice } from '../../../security-devices/infrastructure/orm/security-devices.entity';

@Entity()
export class User extends DateTimestampEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', collation: 'С' })
  login: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  isConfirmed: boolean;

  @Column({ type: 'varchar', nullable: true })
  passwordRecoveryCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  passwordRecoveryExpiration: number | null;

  @Column({ type: 'varchar', nullable: true })
  emailConfirmationExpiration: number | null;

  @Column({ type: 'varchar', nullable: true })
  emailConfirmationCode: string | null;

  @OneToMany(() => SecurityDevice, (sd) => sd.user)
  securityDevices: SecurityDevice[];

  updateEmailConfirmation(newConfirmationCode?: boolean): void {
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

  async updatePassword(newPassword: string): Promise<void> {
    this.password = await hash(newPassword, 10);
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

  static async create(
    { login, password, email }: UserCreateDto,
    emailConfirmation?: boolean,
  ): Promise<User> {
    const instance = new this();

    const id = new Date().getTime().toString();
    const passwordHash = await hash(password, 10);

    instance.id = id;
    instance.login = login;
    instance.email = email;
    instance.password = passwordHash;
    instance.isConfirmed = !emailConfirmation;
    instance.emailConfirmationCode = emailConfirmation ? uuidv4() : null;
    instance.emailConfirmationExpiration = emailConfirmation
      ? add(new Date(), { hours: 1 }).getTime()
      : null;

    return instance;
  }
}
