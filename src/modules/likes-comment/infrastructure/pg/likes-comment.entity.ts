import { STATUSES_LIKE } from '../../../../constants';

export class LikesCommentEntity {
  private constructor(
    public commentId: string,
    public userId: string,
    public status: Exclude<STATUSES_LIKE, STATUSES_LIKE.NONE>,
  ) {}
}
