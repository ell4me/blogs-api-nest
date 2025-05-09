import { STATUSES_LIKE } from '../../constants';

import { NewestLikeInfoViewDto } from './likes-post.dto';

export interface LikesInfo extends NewestLikeInfoViewDto {
  postId: string;
}

export interface LikesPostCreate {
  status: STATUSES_LIKE;
  userId: string;
  postId: string;
}
