import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';

import { ROUTERS_PATH } from '../../constants';
import { UsersPgRepository } from '../users/infrastructure/pg/users.pg-repository';
import { SecurityDevicesPgRepository } from '../security-devices/infrastructure/pg/security-devices.pg-repository';
import { BlogsPgRepository } from '../blogs/infrastructure/pg/blogs.pg-repository';
import { PostsPgRepository } from '../posts/infrastructure/pg/posts.pg-repository';
import { CommentsPgRepository } from '../comments/infrastructure/pg/comments.pg-repository';
import { LikesCommentPgRepository } from '../likes-comment/infrastructure/likes-comment.pg-repository';
import { LikesPostPgRepository } from '../likes-post/infrastructure/pg/likes-post.pg-repository';

@Controller(ROUTERS_PATH.TESTING)
export class TestingController {
  constructor(
    private readonly usersPgRepository: UsersPgRepository,
    private readonly securityDevicesPgRepository: SecurityDevicesPgRepository,
    private readonly blogsPgRepository: BlogsPgRepository,
    private readonly postsPgRepository: PostsPgRepository,
    private readonly commentsPgRepository: CommentsPgRepository,
    private readonly likesCommentPgRepository: LikesCommentPgRepository,
    private readonly likesPostPgRepository: LikesPostPgRepository,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    await this.securityDevicesPgRepository.deleteAll();
    await this.likesCommentPgRepository.deleteAll();
    await this.likesPostPgRepository.deleteAll();
    await this.commentsPgRepository.deleteAll();
    await this.usersPgRepository.deleteAll();
    await this.postsPgRepository.deleteAll();
    await this.blogsPgRepository.deleteAll();
  }
}
