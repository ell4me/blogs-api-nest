import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';

import { ROUTERS_PATH } from '../../constants';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { BlogsRepository } from '../blogs/infrastructure/blogs.repository';
import { CommentsRepository } from '../comments/infrastructure/comments.repository';
import { LikesPostRepository } from '../likes-post/infrastructure/likes-post.repository';
import { SecurityDevicesRepository } from '../security-devices/infrastructure/security-devices.repository';
import { UsersPgRepository } from '../users/infrastructure/users.pg-repository';
import { SecurityDevicesPgRepository } from '../security-devices/infrastructure/security-devices.pg-repository';

@Controller(ROUTERS_PATH.TESTING)
export class TestingController {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly likesPostRepository: LikesPostRepository,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly usersPgRepository: UsersPgRepository,
    private readonly securityDevicesPgRepository: SecurityDevicesPgRepository,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    await this.usersRepository.deleteAll();
    await this.postsRepository.deleteAll();
    await this.blogsRepository.deleteAll();
    await this.commentsRepository.deleteAll();
    await this.likesPostRepository.deleteAll();
    await this.securityDevicesRepository.deleteAll();

    await this.usersPgRepository.deleteAll();
    await this.securityDevicesPgRepository.deleteAll();
  }
}
