import { StatusLike } from '../../types';

import { CommentatorInfo } from './infrastructure/comments.model';

export interface CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: LikesInfoDto;
}

export interface CommentCreateDto {
  content: string;
}

export interface CommentUpdateDto {
  content: string;
}

export interface CommentLikeDto {
  likeStatus: StatusLike;
}

export interface LikesInfoDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: StatusLike;
}
