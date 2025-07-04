import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { LikesInfo } from '../../likes-post.types';
import { STATUSES_LIKE } from '../../../../constants';
import { NewestLikeInfoViewDto } from '../../likes-post.dto';

import { LikesPost } from './likes-post.entity';

@Injectable()
export class LikesPostOrmQueryRepository {
  constructor(
    @InjectRepository(LikesPost)
    private readonly likesPostRepository: Repository<LikesPost>,
    private readonly dataSource: DataSource,
  ) {}

  getNewestLikesByPostId(postId: string): Promise<NewestLikeInfoViewDto[]> {
    return this.likesPostRepository
      .createQueryBuilder('lp')
      .select(['lp."userId"', 'lp."updatedAt" as "addedAt"', 'u."login"'])
      .leftJoin('lp.user', 'u')
      .where('lp."postId" = :postId', { postId })
      .andWhere('lp."status" = :likeStatus', {
        likeStatus: STATUSES_LIKE.LIKE,
      })
      .orderBy('lp."updatedAt"', 'DESC')
      .limit(3)
      .getRawMany<NewestLikeInfoViewDto>();
  }

  async getNewestLikesByPostsId<T extends string>(
    postIds: T[],
  ): Promise<Record<T, NewestLikeInfoViewDto[]>> {
    const builder = this.dataSource
      .createQueryBuilder()
      .select('*')
      .from(
        (subQuery) =>
          subQuery
            .from(LikesPost, 'lp')
            .select([
              'lp."userId"',
              'lp."postId"',
              'lp."updatedAt" as "addedAt"',
              'u."login"',
              'ROW_NUMBER() OVER (PARTITION BY lp."postId" ORDER BY lp."updatedAt" desc) as "position"',
            ])
            .leftJoin('lp.user', 'u')
            .where('lp."postId" IN (:...postIds)', { postIds })
            .andWhere('lp."status" = :likeStatus', {
              likeStatus: STATUSES_LIKE.LIKE,
            }),
        'likes',
      )
      .where('position < 4');

    const result = await builder.getRawMany<LikesInfo>();

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
