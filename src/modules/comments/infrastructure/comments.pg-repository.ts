import { Injectable } from '@nestjs/common';
import { DeleteResult } from 'mongodb';
import { DataSource } from 'typeorm';

import { NotFoundDomainException } from '../../../common/exception/domain-exception';
import { CommentCreateDto } from '../comments.dto';

import { CommentEntity } from './comments.entity';

@Injectable()
export class CommentsPgRepository {
  constructor(private readonly dataSource: DataSource) {}

  async create(
    commentCreateDto: CommentCreateDto,
    postId: string,
    userId: string,
  ): Promise<{ id: string }> {
    const createdComment = CommentEntity.createPojo(
      commentCreateDto,
      postId,
      userId,
    );

    await this.dataSource.query(
      `
      INSERT INTO "Comments" ("id", "postId", "commentatorId", "content")
      VALUES ($1, $2, $3, $4)
    `,
      [
        createdComment.id,
        createdComment.postId,
        createdComment.commentatorId,
        createdComment.content,
      ],
    );

    return { id: createdComment.id };
  }

  async save(comment: CommentEntity): Promise<CommentEntity> {
    await this.dataSource.query(
      `
      UPDATE "Comments" SET "content"=$1, "updatedAt"=DEFAULT
      WHERE id=$2
    `,
      [comment.content, comment.id],
    );

    return comment;
  }

  async findOrNotFoundFail(id: string): Promise<CommentEntity> {
    const comment = await this.dataSource.query(
      `SELECT * FROM "Comments" WHERE id=$1`,
      [id],
    );

    if (!comment[0]) {
      throw NotFoundDomainException.create();
    }

    return CommentEntity.createInstance(comment[0]);
  }

  async deleteById(id: string): Promise<boolean> {
    return this.dataSource.query(`DELETE FROM "Comments" WHERE id=$1`, [id]);
  }

  deleteAll(): Promise<DeleteResult> {
    return this.dataSource.query(`DELETE FROM "Comments"`);
  }
}
