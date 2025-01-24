import { IsEnum, IsString, Length } from 'class-validator';

import { STATUSES_LIKE } from '../../constants';

import { CommentatorInfo } from './infrastructure/comments.model';
import { Transform } from 'class-transformer';

export interface CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: LikesInfoDto;
}

export interface LikesInfoDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: STATUSES_LIKE;
}

export class CommentCreateDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(20, 300)
  content: string;
}

export class CommentUpdateDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(20, 300)
  content: string;
}

export class CommentLikeDto {
  @IsEnum(STATUSES_LIKE)
  likeStatus: STATUSES_LIKE;
}
