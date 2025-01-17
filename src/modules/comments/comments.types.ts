import { CommentatorInfo } from './infrastructure/comments.model';

export interface CommentCreate {
  id: string;
  postId: string;
  content: string;
  commentatorInfo: CommentatorInfo;
}
