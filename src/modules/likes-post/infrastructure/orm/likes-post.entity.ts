import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { STATUSES_LIKE } from '../../../../constants';
import { DateTimestampEntity } from '../../../../common/helpers/date-timestamp';
import { User } from '../../../users/infrastructure/orm/user.entity';
import { Post } from '../../../posts/infrastructure/orm/post.entity';
import { LikesPostCreate } from '../../likes-post.types';

@Entity()
export class LikesPost extends DateTimestampEntity {
  @PrimaryColumn()
  postId: string;

  @PrimaryColumn()
  userId: string;

  @Column({ type: 'enum', enum: STATUSES_LIKE })
  status: STATUSES_LIKE;

  @ManyToOne(() => Post, (p) => p.likes)
  post: Post;

  @ManyToOne(() => User, (u) => u.likesPosts)
  user: User;

  updateStatus(status: STATUSES_LIKE) {
    this.status = status;
  }

  static create({ userId, postId, status }: LikesPostCreate): LikesPost {
    const instance = new this();
    instance.userId = userId;
    instance.postId = postId;
    instance.status = status;

    return instance;
  }
}
