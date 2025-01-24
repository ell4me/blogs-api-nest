import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export interface UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
}

export class UserCreateDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login: string;

  @IsEmail()
  email: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(6, 20)
  password: string;
}
