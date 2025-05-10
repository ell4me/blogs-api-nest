import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

import { DateTimestampEntity } from '../../../../common/helpers/date-timestamp';
import { PostCreateByBlogIdDto, PostUpdateDto } from '../../api/posts.dto';
import { Blog } from '../../../blogs/infrastructure/orm/blog.entity';
import { Comment } from '../../../comments/infrastructure/orm/comment.entity';
import { LikesPost } from '../../../likes-post/infrastructure/orm/likes-post.entity';
import { STATUSES_LIKE } from '../../../../constants';

@Entity()
export class Post extends DateTimestampEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @ManyToOne(() => Blog, (b) => b.posts)
  blog: Blog;

  @Column()
  blogId: string;

  @OneToMany(() => Comment, (c) => c.post)
  comments: Comment[];

  @OneToMany(() => LikesPost, (lp) => lp.post)
  likes: LikesPost[];

  updatePost({ content, shortDescription, title }: PostUpdateDto) {
    this.content = content;
    this.title = title;
    this.shortDescription = shortDescription;
  }

  static create({
    blogId,
    content,
    shortDescription,
    title,
  }: PostCreateByBlogIdDto): Post {
    const instance = new this();

    instance.id = new Date().getTime().toString();
    instance.title = title;
    instance.content = content;
    instance.shortDescription = shortDescription;
    instance.blogId = blogId;

    return instance;
  }

  static getCurrentStatusLikeUser(
    currentLikeStatusUser: STATUSES_LIKE | null,
  ): STATUSES_LIKE {
    return currentLikeStatusUser ? currentLikeStatusUser : STATUSES_LIKE.NONE;
  }
}
