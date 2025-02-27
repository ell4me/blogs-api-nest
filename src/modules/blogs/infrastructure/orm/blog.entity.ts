import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { DateTimestampEntity } from '../../../../common/helpers/date-timestamp';
import { BlogCreateDto, BlogUpdateDto } from '../../blogs.dto';
import { Post } from '../../../posts/infrastructure/orm/post.entity';

@Entity()
export class Blog extends DateTimestampEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column()
  isMembership: boolean;

  @OneToMany(() => Post, (p) => p.blog)
  posts: Post[];

  static create({ name, websiteUrl, description }: BlogCreateDto) {
    const instance = new this();

    instance.id = new Date().getTime().toString();
    instance.isMembership = false;
    instance.description = description;
    instance.websiteUrl = websiteUrl;
    instance.name = name;

    return instance;
  }

  update({ description, websiteUrl, name }: BlogUpdateDto) {
    this.description = description;
    this.websiteUrl = websiteUrl;
    this.name = name;
  }
}
