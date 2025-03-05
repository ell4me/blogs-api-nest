import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

import { DateTimestampEntity } from '../../../../common/helpers/date-timestamp';
import { CommentCreateDto, CommentUpdateDto } from '../../comments.dto';
import { STATUSES_LIKE } from '../../../../constants';
import { User } from '../../../users/infrastructure/orm/user.entity';
import { Post } from '../../../posts/infrastructure/orm/post.entity';
import { LikesComment } from '../../../likes-comment/infrastructure/orm/like-comment.entity';

@Entity()
export class Comment extends DateTimestampEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => User, (u) => u.comments)
  commentator: User;

  @ManyToOne(() => Post, (p) => p.comments)
  post: Post;

  @Column()
  postId: string;

  @Column()
  commentatorId: string;

  @OneToMany(() => LikesComment, (lc) => lc.comment)
  likes: LikesComment[];

  updateComment({ content }: CommentUpdateDto) {
    this.content = content;
  }

  static create(
    { content }: CommentCreateDto,
    postId: string,
    userId: string,
  ): Comment {
    const instance = new this();
    instance.id = new Date().getTime().toString();
    instance.content = content;
    instance.commentatorId = userId;
    instance.postId = postId;

    return instance;
  }

  static getCurrentStatusLikeUser(
    currentLikeStatusUser: STATUSES_LIKE | null,
  ): STATUSES_LIKE {
    return currentLikeStatusUser ? currentLikeStatusUser : STATUSES_LIKE.NONE;
  }
}
