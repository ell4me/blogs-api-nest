import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { STATUSES_LIKE } from '../../../constants';
import { ExtendedLikesInfo } from '../likesPost.types';

import {
  LikesPost,
  LikesPostDocument,
  TLikesPostModel,
} from './likesPost.model';

@Injectable()
export class LikesPostQueryRepository {
  constructor(
    @InjectModel(LikesPost.name)
    private readonly LikesPostModel: TLikesPostModel,
  ) {}

  async getByPostId(
    postId: string,
    userId?: string,
  ): Promise<ExtendedLikesInfo> {
    const likes: LikesPost[] = await this.LikesPostModel.find({ postId })
      .where('status', STATUSES_LIKE.LIKE)
      .limit(3)
      .sort({ createdAt: -1 })
      .lean();

    const likesCount = await this.LikesPostModel.find({ postId })
      .where('status', STATUSES_LIKE.LIKE)
      .countDocuments()
      .exec();

    const dislikesCount = await this.LikesPostModel.find({ postId })
      .where('status', STATUSES_LIKE.DISLIKE)
      .countDocuments()
      .exec();

    let likeByUserId: LikesPostDocument | null = null;

    if (userId) {
      likeByUserId = await this.LikesPostModel.findOne({
        'user.id': userId,
        postId,
      });
    }

    return {
      likesCount,
      dislikesCount,
      myStatus: likeByUserId ? likeByUserId.status : STATUSES_LIKE.NONE,
      newestLikes: likes.length
        ? likes.map(({ user, createdAt }) => ({
            userId: user.id,
            login: user.login,
            addedAt: createdAt,
          }))
        : [],
    };
  }

  async getByPostIds(
    postIds: string[],
    userId?: string,
  ): Promise<Record<string, ExtendedLikesInfo>> {
    const likes: LikesPost[] = await this.LikesPostModel.find()
      .where('postId')
      .in(postIds)
      .sort({ createdAt: -1 })
      .lean();

    const extendedLikesInfo: Record<string, ExtendedLikesInfo> = {};

    postIds.forEach((postId) => {
      extendedLikesInfo[postId] = {
        likesCount: 0,
        dislikesCount: 0,
        newestLikes: [],
        myStatus: STATUSES_LIKE.NONE,
      };
    });

    likes.forEach(({ postId, createdAt, status, user }) => {
      const currentLikesPost = extendedLikesInfo[postId];
      if (status === STATUSES_LIKE.LIKE) {
        currentLikesPost.likesCount += 1;

        if (currentLikesPost.newestLikes.length < 3) {
          currentLikesPost.newestLikes.push({
            addedAt: createdAt,
            userId: user.id,
            login: user.login,
          });
        }
      }

      if (status === STATUSES_LIKE.DISLIKE) {
        currentLikesPost.dislikesCount += 1;
      }

      if (
        userId === user.id &&
        currentLikesPost.myStatus === STATUSES_LIKE.NONE
      ) {
        currentLikesPost.myStatus = status;
      }
    });

    return extendedLikesInfo;
  }
}
