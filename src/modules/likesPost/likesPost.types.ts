import { STATUSES_LIKE } from '../../constants';

export interface ExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: STATUSES_LIKE;
  newestLikes: LikesInfo[];
}

interface LikesInfo {
  addedAt: Date;
  userId: string;
  login: string;
}
