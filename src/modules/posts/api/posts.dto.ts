import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

import { STATUSES_LIKE } from '../../../constants';
import { ExtendedLikesInfoViewDto } from '../../likes-post/likes-post.dto';

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

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoViewDto;
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
