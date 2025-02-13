import { STATUSES_LIKE } from '../../constants';

export interface LikesCommentCreate {
  status: STATUSES_LIKE;
  commentId: string;
  userId: string;
}
