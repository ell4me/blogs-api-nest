import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { STATUSES_LIKE } from '../../../../constants';

import {
  LikePostUserInfo,
  LikesPost,
  LikesPostDocument,
  TLikesPostModel,
} from './likes-post.model';

@Injectable()
export class LikesPostRepository {
  constructor(
    @InjectModel(LikesPost.name)
    private readonly LikesPostModel: TLikesPostModel,
  ) {}

  async getLikePost(
    userId: string,
    postId: string,
  ): Promise<LikesPostDocument | null> {
    return this.LikesPostModel.findOne({
      'user.id': userId,
      postId,
    });
  }

  async create(
    postId: string,
    likeStatus: STATUSES_LIKE,
    user: LikePostUserInfo,
  ): Promise<LikesPostDocument> {
    const like = new this.LikesPostModel({
      id: Date.now(),
      user,
      postId,
      status: likeStatus,
    });
    return like.save();
  }

  save(like: LikesPostDocument): Promise<LikesPostDocument> {
    return like.save();
  }

  async delete(id: string): Promise<boolean> {
    const { deletedCount } = await this.LikesPostModel.deleteOne({ id }).exec();

    return deletedCount === 1;
  }

  async deleteAll(): Promise<void> {
    await this.LikesPostModel.deleteMany().exec();
  }
}
