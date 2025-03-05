import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { LikesPostCreate } from '../../likes-post.types';

import { LikesPost } from './likes-post.entity';

@Injectable()
export class LikesPostOrmRepository {
  constructor(
    @InjectRepository(LikesPost)
    private readonly likesPostRepository: Repository<LikesPost>,
  ) {}

  async findOne(postId: string, userId: string): Promise<LikesPost | null> {
    return this.likesPostRepository.findOneBy({
      postId,
      userId,
    });
  }

  create(likesPostCreate: LikesPostCreate): Promise<LikesPost> {
    const likePost = LikesPost.create(likesPostCreate);
    return this.likesPostRepository.save(likePost);
  }

  save(likesPost: LikesPost): Promise<LikesPost> {
    return this.likesPostRepository.save(likesPost);
  }

  async deleteOne(postId: string, userId: string): Promise<boolean> {
    const { affected } = await this.likesPostRepository.delete({
      postId,
      userId,
    });
    return !!affected;
  }

  deleteAll(): Promise<DeleteResult> {
    return this.likesPostRepository.delete({});
  }
}
