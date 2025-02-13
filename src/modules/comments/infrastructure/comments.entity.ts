import {
  DateTimestamp,
  TEntityWithoutDate,
} from '../../../common/helpers/date-timestamp';
import { CommentCreateDto, CommentUpdateDto } from '../comments.dto';
import { STATUSES_LIKE } from '../../../constants';

interface CommentEntityInstanceMethods {
  updateComment: (commentUpdateDto: CommentUpdateDto) => void;
}

type CommentEntityWithoutMethods = Omit<
  CommentEntity,
  keyof CommentEntityInstanceMethods
>;

export class CommentEntity extends DateTimestamp {
  public currentLikeStatusUser: STATUSES_LIKE;
  public dislikes: number;
  public likes: number;

  private constructor(
    public id: string,
    public postId: string,
    public commentatorId: string,
    public commentatorLogin: string,
    public content: string,
    public createdAt: string,
    public updatedAt: string,
  ) {
    super(createdAt, updatedAt);
  }

  updateComment({ content }: CommentUpdateDto) {
    this.content = content;
  }

  static createInstance(comment: CommentEntityWithoutMethods): CommentEntity {
    const instance = new this(
      comment.id,
      comment.postId,
      comment.commentatorId,
      comment.commentatorLogin,
      comment.content,
      comment.createdAt,
      comment.updatedAt,
    );

    instance.likes = comment.likes ? comment.likes : 0;
    instance.dislikes = comment.dislikes ? comment.dislikes : 0;
    instance.currentLikeStatusUser = CommentEntity.getCurrentStatusLikeUser(
      comment.currentLikeStatusUser,
    );

    return instance;
  }

  static createPojo(
    { content }: CommentCreateDto,
    postId: string,
    userId: string,
  ): TEntityWithoutDate<
    Omit<
      CommentEntityWithoutMethods,
      'commentatorLogin' | 'currentLikeStatusUser' | 'dislikes' | 'likes'
    >
  > {
    return {
      id: new Date().getTime().toString(),
      content,
      postId,
      commentatorId: userId,
    };
  }

  static getCurrentStatusLikeUser(
    currentLikeStatusUser: STATUSES_LIKE | null,
  ): STATUSES_LIKE {
    return currentLikeStatusUser ? currentLikeStatusUser : STATUSES_LIKE.NONE;
  }
}
