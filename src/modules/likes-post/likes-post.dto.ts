import { IsEnum } from 'class-validator';

import { STATUSES_LIKE } from '../../constants';

export class LikesPostUpdateDto {
  @IsEnum(STATUSES_LIKE)
  likeStatus: STATUSES_LIKE;
}

export class NewestLikeInfoViewDto {
  addedAt: Date;
  userId: string;
  login: string;
}

export class ExtendedLikesInfoViewDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: STATUSES_LIKE;
  newestLikes: NewestLikeInfoViewDto[];
}
