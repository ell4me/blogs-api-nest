import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';

import { ROUTERS_PATH } from '../../constants';
import { CommentsPgRepository } from '../comments/infrastructure/pg/comments.pg-repository';
import { LikesCommentPgRepository } from '../likes-comment/infrastructure/likes-comment.pg-repository';
import { LikesPostPgRepository } from '../likes-post/infrastructure/pg/likes-post.pg-repository';
import { UsersOrmRepository } from '../users/infrastructure/orm/users.orm-repository';
import { SecurityDevicesOrmRepository } from '../security-devices/infrastructure/orm/security-devices.orm-repository';
import { BlogsOrmRepository } from '../blogs/infrastructure/orm/blogs.orm-repository';
import { PostsOrmRepository } from '../posts/infrastructure/orm/posts.orm-repository';

@Controller(ROUTERS_PATH.TESTING)
export class TestingController {
  constructor(
    private readonly usersRepository: UsersOrmRepository,
    private readonly securityDevicesRepository: SecurityDevicesOrmRepository,
    private readonly blogsRepository: BlogsOrmRepository,
    private readonly postsRepository: PostsOrmRepository,
    private readonly commentsPgRepository: CommentsPgRepository,
    private readonly likesCommentPgRepository: LikesCommentPgRepository,
    private readonly likesPostPgRepository: LikesPostPgRepository,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    await this.securityDevicesRepository.deleteAll();
    // await this.likesCommentPgRepository.deleteAll();
    // await this.likesPostPgRepository.deleteAll();
    // await this.commentsPgRepository.deleteAll();
    await this.postsRepository.deleteAll();
    await this.blogsRepository.deleteAll();
    await this.usersRepository.deleteAll();
  }
}
