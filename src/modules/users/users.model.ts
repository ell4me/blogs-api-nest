import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { hash } from 'bcrypt';

import { UserCreateDto } from './users.dto';

export type TUserModel = Model<User> & UserStaticMethods;
export type UserDocument = HydratedDocument<User>;

interface UserStaticMethods {
  createInstance: (
    { login, password, email }: UserCreateDto,
    UserModel: TUserModel,
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

  static async createInstance(
    { login, password, email }: UserCreateDto,
    UserModel: TUserModel,
  ): Promise<UserDocument> {
    const id = new Date().getTime().toString();
    const passwordHash = await hash(password, 10);

    return new UserModel({
      id,
      login,
      email,
      password: passwordHash,
      emailConfirmation: {
        isConfirmed: true,
        code: '',
        expiration: 0,
      },
    });
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.statics = {
  createInstance: User.createInstance,
};
