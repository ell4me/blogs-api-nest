import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';

import { UserCreateDto } from './users.dto';

export type TUserModel = Model<User, object, UserInstanceMethods> &
  UserStaticMethods;
export type UserDocument = HydratedDocument<User, UserInstanceMethods>;

interface UserInstanceMethods {
  updateEmailConfirmation: (newConfirmationCode?: boolean) => void;
  updatePasswordRecovery: (newPasswordRecovery?: boolean) => void;
  updatePassword: (newPassword: string) => void;
}

interface UserStaticMethods {
  createInstance: (
    userCreateDto: UserCreateDto,
    UserModel: TUserModel,
    emailConfirmation?: boolean,
  ) => Promise<UserDocument>;
}

@Schema()
export class EmailConfirmation {
  @Prop({ default: false })
  isConfirmed: boolean;

  @Prop({ required: true })
  expiration: number;

  @Prop({ default: '' })
  code: string;
}

@Schema()
export class PasswordRecovery {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  expiration: number;
}

const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);
const PasswordRecoverySchema = SchemaFactory.createForClass(PasswordRecovery);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: EmailConfirmationSchema })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: PasswordRecoverySchema, default: null })
  passwordRecovery: PasswordRecovery | null;

  updateEmailConfirmation(newConfirmationCode?: boolean) {
    if (newConfirmationCode) {
      this.emailConfirmation = {
        code: uuidv4(),
        expiration: add(new Date(), { hours: 1 }).getTime(),
        isConfirmed: false,
      };
      return;
    }

    this.emailConfirmation.isConfirmed = true;
  }

  updatePasswordRecovery(newPasswordRecovery?: boolean) {
    if (newPasswordRecovery) {
      this.passwordRecovery = {
        code: uuidv4(),
        expiration: add(new Date(), { hours: 1 }).getTime(),
      };
      return;
    }

    this.passwordRecovery = {
      code: '',
      expiration: 0,
    };
  }

  async updatePassword(newPassword: string) {
    this.password = await hash(newPassword, 10);
  }

  static async createInstance(
    { login, password, email }: UserCreateDto,
    UserModel: TUserModel,
    emailConfirmation?: boolean,
  ): Promise<UserDocument> {
    const id = new Date().getTime().toString();
    const passwordHash = await hash(password, 10);

    return new UserModel({
      id,
      login,
      email,
      password: passwordHash,
      emailConfirmation: emailConfirmation
        ? {
            code: uuidv4(),
            expiration: add(new Date(), { hours: 1 }).getTime(),
            isConfirmed: false,
          }
        : {
            isConfirmed: true,
            code: '',
            expiration: 0,
          },
    });
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
  updateConfirmation: User.prototype.updateEmailConfirmation,
  updatePasswordRecovery: User.prototype.updatePasswordRecovery,
  updatePassword: User.prototype.updatePassword,
};

UserSchema.statics = {
  createInstance: User.createInstance,
};
