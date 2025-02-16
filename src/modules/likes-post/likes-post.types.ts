import { STATUSES_LIKE } from '../../constants';

export interface ExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: STATUSES_LIKE;
  newestLikes: NewestLikeInfo[];
}

export interface NewestLikeInfo {
  addedAt: Date;
  userId: string;
  login: string;
}

export interface LikesInfo extends NewestLikeInfo {
  postId: string;
}

export interface LikesPostCreate {
  status: STATUSES_LIKE;
  userId: string;
  postId: string;
}
