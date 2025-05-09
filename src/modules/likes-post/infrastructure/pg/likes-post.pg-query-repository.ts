import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { LikesInfo } from '../../likes-post.types';
import { NewestLikeInfoViewDto } from '../../likes-post.dto';

@Injectable()
export class LikesPostPgQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  getNewestLikesByPostId(postId: string): Promise<NewestLikeInfoViewDto[]> {
    return this.dataSource.query(
      `
      SELECT lp."userId", lp."updatedAt" as "addedAt", u."login" FROM "LikesPost" AS lp
      LEFT JOIN "Users" AS u
      ON u."id"=lp."userId"
      WHERE lp."postId" = $1 AND lp."status"='Like'
      ORDER BY lp."updatedAt" desc
      LIMIT 3
    `,
      [postId],
    );
  }

  async getNewestLikesByPostsId<T extends string>(
    postIds: T[],
  ): Promise<Record<T, NewestLikeInfoViewDto[]>> {
    const postIdsIn = postIds.join("','");
    const result: LikesInfo[] = await this.dataSource.query(
      `
      SELECT * FROM (
        SELECT lp."userId", lp."updatedAt" as "addedAt", u."login", lp."postId",
        ROW_NUMBER() OVER (PARTITION BY lp."postId" ORDER BY lp."updatedAt" desc) as "position"
        FROM "LikesPost" AS lp
        LEFT JOIN "Users" AS u
        ON u."id"=lp."userId"
        WHERE lp."postId" IN ('${postIdsIn}') AND lp."status"='Like'
	  ) WHERE "position" < 4
    `,
    );

    const likesInfo: Record<T, NewestLikeInfoViewDto[]> = {} as Record<
      string,
      NewestLikeInfoViewDto[]
    >;

    result.forEach(({ userId, login, addedAt, postId }) => {
      const info = { userId, login, addedAt };
      const currentInfo = likesInfo[postId];
      if (!currentInfo) {
        likesInfo[postId] = [info];
        return;
      }

      currentInfo.push(info);
    });

    return likesInfo;
  }
}
