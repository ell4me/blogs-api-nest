import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { DateTimestampEntity } from '../../../../common/helpers/date-timestamp';
import { PostCreateByBlogIdDto, PostUpdateDto } from '../../posts.dto';
import { Blog } from '../../../blogs/infrastructure/orm/blog.entity';

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
}
