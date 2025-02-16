import { STATUSES_LIKE } from '../../../../constants';
import { DateTimestamp } from '../../../../common/helpers/date-timestamp';

export class LikesPostEntity extends DateTimestamp {
  constructor(
    public userId: string,
    public postId: string,
    public status: Exclude<STATUSES_LIKE, STATUSES_LIKE.NONE>,
    public createdAt: string,
    public updatedAt: string,
  ) {
    super(createdAt, updatedAt);
  }
}
