import {
  DateTimestamp,
  TEntityWithoutDate,
} from '../../../../common/helpers/date-timestamp';
import { PostCreateByBlogIdDto, PostUpdateDto } from '../../api/posts.dto';
import { STATUSES_LIKE } from '../../../../constants';

interface PostEntityInstanceMethods {
  updatePost: (postUpdateDto: PostUpdateDto) => void;
}

type PostEntityWithoutMethods = Omit<
  PostEntity,
  keyof PostEntityInstanceMethods
>;

export class PostEntity extends DateTimestamp {
  public blogName: string;
  public currentLikeStatusUser: STATUSES_LIKE;
  public dislikes: number;
  public likes: number;

  private constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public createdAt: string,
    public updatedAt: string,
  ) {
    super(createdAt, updatedAt);
  }

  updatePost({ content, shortDescription, title }: PostUpdateDto) {
    this.content = content;
    this.title = title;
    this.shortDescription = shortDescription;
  }

  static createInstance(post: PostEntityWithoutMethods): PostEntity {
    const instance = new this(
      post.id,
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.createdAt,
      post.updatedAt,
    );

    instance.blogName = post.blogName ? post.blogName : '';
    instance.likes = post.likes ? post.likes : 0;
    instance.dislikes = post.dislikes ? post.dislikes : 0;
    instance.currentLikeStatusUser = PostEntity.getCurrentStatusLikeUser(
      post.currentLikeStatusUser,
    );

    return instance;
  }

  static createPojo({
    blogId,
    content,
    shortDescription,
    title,
  }: PostCreateByBlogIdDto): TEntityWithoutDate<
    Omit<
      PostEntityWithoutMethods,
      'blogName' | 'currentLikeStatusUser' | 'likes' | 'dislikes'
    >
  > {
    return {
      id: new Date().getTime().toString(),
      title,
      content,
      shortDescription,
      blogId,
    };
  }

  static getCurrentStatusLikeUser(
    currentLikeStatusUser: STATUSES_LIKE | null,
  ): STATUSES_LIKE {
    return currentLikeStatusUser ? currentLikeStatusUser : STATUSES_LIKE.NONE;
  }
}
