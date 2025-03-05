import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { NotFoundDomainException } from '../../../../common/exception/domain-exception';
import { CommentCreateDto } from '../../comments.dto';

import { Comment } from './comment.entity';

@Injectable()
export class CommentsOrmRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async create(
    commentCreateDto: CommentCreateDto,
    postId: string,
    userId: string,
  ): Promise<Comment> {
    const comment = Comment.create(commentCreateDto, postId, userId);
    return this.commentsRepository.save(comment);
  }

  async save(comment: Comment): Promise<Comment> {
    return this.commentsRepository.save(comment);
  }

  async findOrNotFoundFail(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOneBy({ id });

    if (!comment) {
      throw NotFoundDomainException.create();
    }

    return comment;
  }

  async deleteById(id: string): Promise<boolean> {
    const { affected } = await this.commentsRepository.delete({ id });

    return !!affected;
  }

  deleteAll(): Promise<DeleteResult> {
    return this.commentsRepository.delete({});
  }
}
