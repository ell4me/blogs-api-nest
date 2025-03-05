import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { STATUSES_LIKE } from '../../../../constants';
import { Comment } from '../../../comments/infrastructure/orm/comment.entity';
import { User } from '../../../users/infrastructure/orm/user.entity';
import { LikesCommentCreate } from '../../likes-comment.types';

@Entity()
export class LikesComment {
  @ManyToOne(() => Comment, (c) => c.likes)
  comment: Comment;

  @ManyToOne(() => User, (u) => u.likesComments)
  user: User;

  @PrimaryColumn()
  public commentId: string;

  @PrimaryColumn()
  public userId: string;

  @Column({ type: 'enum', enum: STATUSES_LIKE })
  public status: STATUSES_LIKE;

  updateStatus(status: STATUSES_LIKE) {
    this.status = status;
  }

  static create({
    commentId,
    userId,
    status,
  }: LikesCommentCreate): LikesComment {
    const instance = new this();
    instance.userId = userId;
    instance.status = status;
    instance.commentId = commentId;

    return instance;
  }
}
