import { IsEnum } from 'class-validator';

import { STATUSES_LIKE } from '../../constants';

export class LikesPostUpdateDto {
  @IsEnum(STATUSES_LIKE)
  likeStatus: STATUSES_LIKE;
}
