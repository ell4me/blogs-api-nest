import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class AuthLoginDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  loginOrEmail: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  password: string;
}

export class RegistrationConfirmationDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  code: string;
}

export class RegistrationEmailResendingDto {
  @IsEmail()
  email: string;
}

export class PasswordRecoveryEmailDto {
  @IsEmail()
  email: string;
}

export class PasswordRecoveryDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(6, 20)
  newPassword: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  recoveryCode: string;
}
