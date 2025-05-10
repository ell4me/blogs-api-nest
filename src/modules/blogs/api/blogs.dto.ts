import { IsString, IsUrl, Length, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export interface BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
}

export class BlogCreateDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 15)
  name: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 500)
  description: string;

  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}

export class BlogUpdateDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 15)
  name: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 500)
  description: string;

  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
