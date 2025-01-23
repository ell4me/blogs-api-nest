import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { CommentUpdateDto } from '../comments.dto';
import { STATUSES_LIKE } from '../../../constants';

interface CommentInstanceMethods {
  updateComment: (comment: CommentUpdateDto) => void;
  updateLikeStatus: (
    userId: string,
    likeStatus: STATUSES_LIKE,
    prevLikeStatus: STATUSES_LIKE,
  ) => void;
}

export type TCommentModel = Model<Comment, object, CommentInstanceMethods>;
export type CommentDocument = HydratedDocument<Comment, CommentInstanceMethods>;

@Schema()
export class CommentatorInfo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;
}

@Schema()
export class LikesInfo {
  @Prop({ type: [String], default: [] })
  likes: string[];

  @Prop({ type: [String], default: [] })
  dislikes: string[];
}

const CommentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo);
const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: LikesInfoSchema })
  likesInfo: LikesInfo;

  updateComment(comment: CommentUpdateDto) {
    this.content = comment.content;
  }

  updateLikeStatus(
    userId: string,
    likeStatus: STATUSES_LIKE,
    prevLikeStatus: STATUSES_LIKE,
  ) {
    const updateLikeStatusMappingSetter = {
      [STATUSES_LIKE.LIKE]: () => {
        this.likesInfo.likes.push(userId);
        this.likesInfo.dislikes = this.likesInfo.dislikes.filter(
          (dislike) => dislike !== userId,
        );
      },
      [STATUSES_LIKE.DISLIKE]: () => {
        this.likesInfo.dislikes.push(userId);
        this.likesInfo.likes = this.likesInfo.likes.filter(
          (dislike) => dislike !== userId,
        );
      },
      [STATUSES_LIKE.NONE]: () => {
        if (prevLikeStatus === STATUSES_LIKE.LIKE) {
          this.likesInfo.likes = this.likesInfo.likes.filter(
            (dislike) => dislike !== userId,
          );

          return;
        }

        this.likesInfo.dislikes = this.likesInfo.dislikes.filter(
          (dislike) => dislike !== userId,
        );
      },
    };

    updateLikeStatusMappingSetter[likeStatus]();
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Methods
CommentSchema.methods.updatePost = Comment.prototype.updateComment;
CommentSchema.methods.updateLikeStatus = Comment.prototype.updateLikeStatus;
