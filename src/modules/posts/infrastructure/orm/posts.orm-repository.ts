import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { PostCreateByBlogIdDto } from '../../posts.dto';
import { NotFoundDomainException } from '../../../../common/exception/domain-exception';

import { Post } from './post.entity';

@Injectable()
export class PostsOrmRepository {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
  ) {}

  async findOrNotFoundFail(postId: string, blogId?: string): Promise<Post> {
    const post = await this.postsRepository.findOneBy({ id: postId, blogId });

    if (!post) {
      throw NotFoundDomainException.create();
    }

    return post;
  }

  async deleteAllByBlogId(blogId: string): Promise<boolean> {
    const { affected } = await this.postsRepository.delete({ blogId });

    return !!affected;
  }

  save(post: Post): Promise<Post> {
    return this.postsRepository.save(post);
  }

  async deleteOrNotFoundFail(postId: string, blogId: string): Promise<void> {
    const { affected } = await this.postsRepository.delete({
      id: postId,
      blogId,
    });

    if (!affected) {
      throw NotFoundDomainException.create();
    }

    return;
  }

  create(postCreateByBlogIdDto: PostCreateByBlogIdDto): Promise<Post> {
    const post = Post.create(postCreateByBlogIdDto);
    return this.postsRepository.save(post);
  }

  deleteAll(): Promise<DeleteResult> {
    return this.postsRepository.delete({});
  }
}
