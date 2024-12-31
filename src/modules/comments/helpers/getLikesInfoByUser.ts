import { StatusLike } from '../../../types';
import { LikesInfo } from '../comments.model';
import { LikesInfoDto } from '../comments.dto';

export const getLikesInfoByUser = (
  likesInfo: LikesInfo,
  userId?: string,
): LikesInfoDto => {
  let myStatus: StatusLike = 'None';

  if (userId) {
    if (likesInfo.likes.includes(String(userId))) {
      myStatus = 'Like';
    }

    if (likesInfo.dislikes.includes(String(userId))) {
      myStatus = 'Dislike';
    }
  }

  return {
    likesCount: likesInfo.likes.length,
    dislikesCount: likesInfo.dislikes.length,
    myStatus,
  };
};
