import { compare } from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { VALIDATION_MESSAGES } from '../../../constants';
import { UserCreateDto } from '../../users/users.dto';
import { ValidationErrorViewDto } from '../../../types';
import { UsersService } from '../../users/application/users.service';
import { Token } from '../../users/users.types';
import { getErrorMessage } from '../../../common/helpers/getErrorMessage';
import {
  AuthLoginDto,
  PasswordRecoveryDto,
  PasswordRecoveryEmailDto,
  RegistrationConfirmationDto,
  RegistrationEmailResendingDto,
} from '../auth.dto';

import { EmailAdapter } from './adapters/email.adapter';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailAdapter: EmailAdapter,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser({
    loginOrEmail,
    password,
  }: AuthLoginDto): Promise<string | void> {
    const user = await this.usersService.getUserByEmailOrLogin({
      email: loginOrEmail,
      login: loginOrEmail,
    });

    if (!user) {
      return;
    }

    const isCorrectPassword = await compare(password, user.password);

    if (!isCorrectPassword) {
      return;
    }

    return user.id;
  }

  async login(userId: string): Promise<Token> {
    return {
      accessToken: this.jwtService.sign({ userId }),
    };
  }

  async registration(
    userCreateDto: UserCreateDto,
  ): Promise<ValidationErrorViewDto | void> {
    const result = await this.usersService.createUser(userCreateDto, true);

    if ('errorsMessages' in result) {
      return result;
    }

    this.emailAdapter
      .sendEmailConfirmation(result.email, result.emailConfirmation.code)
      .catch(() => this.registrationEmailResending({ email: result.email }));
  }

  async registrationConfirmation({
    code,
  }: RegistrationConfirmationDto): Promise<ValidationErrorViewDto | void> {
    const user = await this.usersService.getUserByConfirmationCode(code);

    if (!user) {
      return getErrorMessage(
        'code',
        VALIDATION_MESSAGES.CODE_IS_NOT_CORRECT('Confirmation'),
      );
    }

    if (user.emailConfirmation.isConfirmed) {
      return getErrorMessage(
        'code',
        VALIDATION_MESSAGES.USER_ALREADY_CONFIRMED,
      );
    }

    if (user.emailConfirmation.expiration < new Date().getTime()) {
      return getErrorMessage(
        'code',
        VALIDATION_MESSAGES.CODE_EXPIRED('Confirmation'),
      );
    }

    await this.usersService.updateUserEmailConfirmation(user);

    return;
  }

  async registrationEmailResending({
    email,
  }: RegistrationEmailResendingDto): Promise<ValidationErrorViewDto | void> {
    const user = await this.usersService.getUserByEmailOrLogin({ email });

    if (!user) {
      return getErrorMessage('email', VALIDATION_MESSAGES.USER_IS_NOT_FOUND);
    }

    if (user.emailConfirmation.isConfirmed) {
      return getErrorMessage(
        'email',
        VALIDATION_MESSAGES.USER_ALREADY_CONFIRMED,
      );
    }

    await this.usersService.updateUserEmailConfirmation(user, true);

    this.emailAdapter
      .sendEmailConfirmation(user.email, user.emailConfirmation.code)
      .catch(() => console.error('Send email failed'));
  }

  async sendPasswordRecoveryEmail({
    email,
  }: PasswordRecoveryEmailDto): Promise<void> {
    const user = await this.usersService.getUserByEmailOrLogin({ email });

    if (!user) {
      return;
    }

    await this.usersService.updateUserPasswordRecovery(user, true);

    await this.emailAdapter
      .sendEmailRecoveryPassword(email, user.passwordRecovery!.code)
      .catch(() => console.error('Send email failed'));

    return;
  }

  async updateUserPasswordByRecoveryCode({
    recoveryCode,
    newPassword,
  }: PasswordRecoveryDto): Promise<
    | ValidationErrorViewDto
    | {
        result: boolean;
      }
  > {
    const user =
      await this.usersService.getUserByPasswordRecoveryCode(recoveryCode);

    if (!user) {
      return getErrorMessage(
        'recoveryCode',
        VALIDATION_MESSAGES.CODE_IS_NOT_CORRECT('Recovery'),
      );
    }

    if (
      !user.passwordRecovery?.expiration ||
      user.passwordRecovery.expiration < new Date().getTime()
    ) {
      return getErrorMessage(
        'recoveryCode',
        VALIDATION_MESSAGES.CODE_EXPIRED('Recovery'),
      );
    }

    await this.usersService.updateUserPasswordRecovery(user);
    await this.usersService.updateUserPassword(user, newPassword);

    return { result: true };
  }
}
