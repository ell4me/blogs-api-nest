import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { PostCreateByBlogIdDto } from '../posts.dto';
import { NotFoundDomainException } from '../../../common/exception/domain-exception';

import { PostEntity } from './posts.entity';

@Injectable()
export class PostsPgRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findOrNotFoundFail(id: string): Promise<PostEntity> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Posts" WHERE "id"=$1`,
      [id],
    );

    if (!result[0]) {
      throw NotFoundDomainException.create();
    }

    return result[0];
  }

  async deleteAllByBlogId(blogId: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM "Posts" WHERE "blogId"=$1`, [
      blogId,
    ]);
    return;
  }

  async save(post: PostEntity): Promise<PostEntity> {
    await this.dataSource.query(
      `
      UPDATE "Posts" SET "title"=$1, 
       "shortDescription"=$2,
       "content"=$3, 
       "blogId"=$4,
       "updatedAt"=DEFAULT
      WHERE id=$7
    `,
      [post.title, post.shortDescription, post.content, post.blogId],
    );

    return post;
  }

  async deleteOrNotFoundFail(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Posts" WHERE "id"=$1`,
      [id],
    );

    if (!result[1]) {
      throw NotFoundDomainException.create();
    }

    return true;
  }

  async create(newPost: PostCreateByBlogIdDto) {
    const post = PostEntity.createPojo(newPost);
    await this.dataSource.query(
      `
      INSERT INTO "Posts" ("id", "shortDescription", "content", "title", "blogId")
      VALUES($1, $2, $3, $4, $5)
    `,
      [post.id, post.shortDescription, post.content, post.title, post.blogId],
    );

    return post;
  }

  deleteAll(): Promise<any> {
    return this.dataSource.query(`DELETE FROM "Posts"`);
  }
}
