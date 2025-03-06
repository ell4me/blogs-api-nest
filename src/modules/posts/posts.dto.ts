import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

import { ExtendedLikesInfo } from '../likes-post/likes-post.types';
import { STATUSES_LIKE } from '../../constants';

export interface PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo;
}

export interface PostRawViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
  currentLikeStatusUser: STATUSES_LIKE;
}

export class PostCreateByBlogIdDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 30)
  title: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 100)
  shortDescription: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 1000)
  content: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  blogId: string;
}

export class PostCreateDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 30)
  title: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 100)
  shortDescription: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 1000)
  content: string;
}

export class PostUpdateDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 30)
  title: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 100)
  shortDescription: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 1000)
  content: string;
}
