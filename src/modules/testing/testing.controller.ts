import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';

import { ROUTERS_PATH } from '../../constants';
import { UsersOrmRepository } from '../users/infrastructure/orm/users.orm-repository';
import { SecurityDevicesOrmRepository } from '../security-devices/infrastructure/orm/security-devices.orm-repository';
import { BlogsOrmRepository } from '../blogs/infrastructure/orm/blogs.orm-repository';
import { PostsOrmRepository } from '../posts/infrastructure/orm/posts.orm-repository';
import { CommentsOrmRepository } from '../comments/infrastructure/orm/comments.orm-repository';
import { LikesCommentOrmRepository } from '../likes-comment/infrastructure/orm/likes-comment.orm-repository';
import { LikesPostOrmRepository } from '../likes-post/infrastructure/orm/likes-post.orm-repository';

@Controller(ROUTERS_PATH.TESTING)
export class TestingController {
  constructor(
    private readonly usersRepository: UsersOrmRepository,
    private readonly securityDevicesRepository: SecurityDevicesOrmRepository,
    private readonly blogsRepository: BlogsOrmRepository,
    private readonly postsRepository: PostsOrmRepository,
    private readonly commentsRepository: CommentsOrmRepository,
    private readonly likesCommentRepository: LikesCommentOrmRepository,
    private readonly likesPostRepository: LikesPostOrmRepository,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    await this.securityDevicesRepository.deleteAll();
    await this.likesCommentRepository.deleteAll();
    await this.likesPostRepository.deleteAll();
    await this.commentsRepository.deleteAll();
    await this.postsRepository.deleteAll();
    await this.blogsRepository.deleteAll();
    await this.usersRepository.deleteAll();
  }
}
