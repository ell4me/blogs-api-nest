import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { STATUSES_LIKE } from '../../../constants';

interface LikesPostInstanceMethods {
  updateStatus: (status: STATUSES_LIKE) => void;
  getIsDelete: () => boolean;
}

export type TLikesPostModel = Model<
  LikesPost,
  object,
  LikesPostInstanceMethods
>;

export type LikesPostDocument = HydratedDocument<
  LikesPost,
  LikesPostInstanceMethods
>;

@Schema({ _id: false })
export class LikePostUserInfo {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  login: string;
}

const LikePostUserInfoSchema = SchemaFactory.createForClass(LikePostUserInfo);

@Schema({ timestamps: true })
export class LikesPost {
  @Prop({ required: true })
  id: string;

  @Prop({ type: LikePostUserInfoSchema, required: true })
  user: LikePostUserInfo;

  @Prop({ required: true })
  postId: string;

  @Prop({ enum: STATUSES_LIKE, required: true })
  status: STATUSES_LIKE;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  updateStatus(status: STATUSES_LIKE): void {
    if (status === 'None') {
      this._isDelete = true;
    }

    if (this.status === status) {
      return;
    }

    this.status = status;
  }

  getIsDelete(): boolean {
    return this._isDelete;
  }

  _isDelete: boolean;
}

export const LikesPostSchema = SchemaFactory.createForClass(LikesPost);

// Methods
LikesPostSchema.methods.updateStatus = LikesPost.prototype.updateStatus;
LikesPostSchema.methods.getIsDelete = LikesPost.prototype.getIsDelete;
