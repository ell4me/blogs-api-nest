import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { LikesCommentCreate } from '../../likes-comment.types';

import { LikesComment } from './like-comment.entity';

@Injectable()
export class LikesCommentOrmRepository {
  constructor(
    @InjectRepository(LikesComment)
    private readonly likesCommentRepository: Repository<LikesComment>,
  ) {}

  async findOne(
    commentId: string,
    userId: string,
  ): Promise<LikesComment | null> {
    return this.likesCommentRepository.findOneBy({
      commentId,
      userId,
    });
  }

  async deleteOne(commentId: string, userId: string): Promise<boolean> {
    const { affected } = await this.likesCommentRepository.delete({
      commentId,
      userId,
    });

    return !!affected;
  }

  async deleteByCommentId(commentId: string): Promise<boolean> {
    const { affected } = await this.likesCommentRepository.delete({
      commentId,
    });

    return !!affected;
  }

  create(likesCommentCreate: LikesCommentCreate): Promise<LikesComment> {
    const like = LikesComment.create(likesCommentCreate);
    return this.likesCommentRepository.save(like);
  }

  save(likesComment: LikesComment): Promise<LikesComment> {
    return this.likesCommentRepository.save(likesComment);
  }

  deleteAll(): Promise<DeleteResult> {
    return this.likesCommentRepository.delete({});
  }
}
