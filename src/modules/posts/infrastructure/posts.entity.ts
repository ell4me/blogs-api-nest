import {
  DateTimestamp,
  TEntityWithoutDate,
} from '../../../common/helpers/date-timestamp';
import { PostCreateByBlogIdDto, PostUpdateDto } from '../posts.dto';

interface PostEntityInstanceMethods {
  updatePost: (postUpdateDto: PostUpdateDto) => void;
}

type PostEntityWithoutMethods = Omit<
  PostEntity,
  keyof PostEntityInstanceMethods
>;

export class PostEntity extends DateTimestamp {
  public blogName: string;

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

  updatePost({ blogId, content, shortDescription, title }: PostUpdateDto) {
    this.blogId = blogId;
    this.content = content;
    this.title = title;
    this.shortDescription = shortDescription;
  }

  static createInstance(post: PostEntityWithoutMethods): PostEntity {
    return new this(
      post.id,
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.createdAt,
      post.updatedAt,
    );
  }

  static createPojo({
    blogId,
    content,
    shortDescription,
    title,
  }: PostCreateByBlogIdDto): TEntityWithoutDate<
    Omit<PostEntityWithoutMethods, 'blogName'>
  > {
    return {
      id: new Date().getTime().toString(),
      title,
      content,
      shortDescription,
      blogId,
    };
  }
}
