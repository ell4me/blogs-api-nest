import { STATUSES_LIKE } from '../../../constants';

interface LikesCommentEntityInstanceMethods {
  updateLikeStatus: (
    userId: string,
    likeStatus: STATUSES_LIKE,
    prevLikeStatus: STATUSES_LIKE,
  ) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type LikesCommentEntityWithoutMethods = Omit<
  LikesCommentEntity,
  keyof LikesCommentEntityInstanceMethods
>;

export class LikesCommentEntity {
  private constructor(
    public commentId: string,
    public userId: string,
    public status: Exclude<STATUSES_LIKE, STATUSES_LIKE.NONE>,
  ) {}
}
