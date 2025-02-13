import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { LikesCommentCreate } from '../likes-comment.types';

@Injectable()
export class LikesCommentPgRepository {
  constructor(private readonly dataSource: DataSource) {}

  deleteByCommentId(commentId: string, userId: string) {
    return this.dataSource.query(
      `DELETE FROM "LikesComment" WHERE "commentId"=$1 AND "userId"=$2`,
      [commentId, userId],
    );
  }

  create({ status, commentId, userId }: LikesCommentCreate) {
    return this.dataSource.query(
      `INSERT INTO "LikesComment" ("status", "commentId", "userId") VALUES ($1, $2, $3)`,
      [status, commentId, userId],
    );
  }

  updateStatus({ status, commentId, userId }: LikesCommentCreate) {
    return this.dataSource.query(
      `UPDATE "LikesComment" SET "status"=$1 WHERE "commentId"=$2 AND "userId"=$3`,
      [status, commentId, userId],
    );
  }

  deleteAll() {
    return this.dataSource.query(`DELETE FROM "LikesComment"`);
  }
}
