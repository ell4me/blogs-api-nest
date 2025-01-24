import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

import { ExtendedLikesInfo } from '../likesPost/likesPost.types';

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

export class PostCreateByBlogIdDto {
  @Length(1, 30)
  title: string;

  @Length(1, 100)
  shortDescription: string;

  @Length(1, 1000)
  content: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  blogId: string;
}

export class PostCreateDto {
  @Length(1, 30)
  title: string;

  @Length(1, 100)
  shortDescription: string;

  @Length(1, 1000)
  content: string;
}

export class PostUpdateDto {
  @Length(1, 30)
  title: string;

  @Length(1, 100)
  shortDescription: string;

  @Length(1, 1000)
  content: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  blogId: string;
}
