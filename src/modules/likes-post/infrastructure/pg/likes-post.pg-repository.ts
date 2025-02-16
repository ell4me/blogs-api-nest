import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { LikesPostCreate } from '../../likes-post.types';

@Injectable()
export class LikesPostPgRepository {
  constructor(private readonly dataSource: DataSource) {}

  async create({ userId, postId, status }: LikesPostCreate) {
    return this.dataSource.query(
      `
      INSERT INTO "LikesPost" ("userId", "postId", "status") VALUES ($1, $2, $3)
    `,
      [userId, postId, status],
    );
  }

  update({ status, postId, userId }: LikesPostCreate) {
    return this.dataSource.query(
      `UPDATE "LikesPost" 
        SET "status"=$1, "updatedAt"=DEFAULT
        WHERE "postId"=$2 AND "userId"=$3`,
      [status, postId, userId],
    );
  }

  deleteOne(postId: string, userId: string) {
    return this.dataSource.query(
      `DELETE FROM "LikesPost" WHERE "postId"=$1 AND "userId"=$2`,
      [postId, userId],
    );
  }

  deleteAll() {
    return this.dataSource.query('DELETE FROM "LikesPost"');
  }
}
