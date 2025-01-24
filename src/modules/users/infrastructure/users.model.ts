import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';

import { UserCreateDto } from '../users.dto';

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

@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({ default: false })
  isConfirmed: boolean;

  @Prop({ required: true })
  expiration: number;

  @Prop({ default: '' })
  code: string;
}

@Schema({ _id: false })
export class PasswordRecovery {
  @Prop({ default: '' })
  code: string;

  @Prop({ default: 0 })
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

// Methods
UserSchema.methods.updateEmailConfirmation =
  User.prototype.updateEmailConfirmation;
UserSchema.methods.updatePasswordRecovery =
  User.prototype.updatePasswordRecovery;
UserSchema.methods.updatePassword = User.prototype.updatePassword;

// Statics
UserSchema.statics.createInstance = User.createInstance;
