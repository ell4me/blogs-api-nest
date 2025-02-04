import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';

import { ROUTERS_PATH } from '../../constants';
import { UsersPgRepository } from '../users/infrastructure/users.pg-repository';
import { SecurityDevicesPgRepository } from '../security-devices/infrastructure/security-devices.pg-repository';
import { BlogsPgRepository } from '../blogs/infrastructure/blogs.pg-repository';
import { PostsPgRepository } from '../posts/infrastructure/posts.pg-repository';
// import { UsersRepository } from '../users/infrastructure/users.repository';
// import { PostsRepository } from '../posts/infrastructure/posts.repository';
// import { BlogsRepository } from '../blogs/infrastructure/blogs.repository';
// import { CommentsRepository } from '../comments/infrastructure/comments.repository';
// import { LikesPostRepository } from '../likes-post/infrastructure/likes-post.repository';
// import { SecurityDevicesRepository } from '../security-devices/infrastructure/security-devices.repository';

@Controller(ROUTERS_PATH.TESTING)
export class TestingController {
  constructor(
    private readonly usersPgRepository: UsersPgRepository,
    private readonly securityDevicesPgRepository: SecurityDevicesPgRepository,
    private readonly blogsPgRepository: BlogsPgRepository,
    private readonly postsPgRepository: PostsPgRepository,

    // private readonly usersRepository: UsersRepository,
    // private readonly postsRepository: PostsRepository,
    // private readonly blogsRepository: BlogsRepository,
    // private readonly commentsRepository: CommentsRepository,
    // private readonly likesPostRepository: LikesPostRepository,
    // private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    await Promise.all([
      this.securityDevicesPgRepository.deleteAll(),
      this.usersPgRepository.deleteAll(),
      this.postsPgRepository.deleteAll(),
      this.blogsPgRepository.deleteAll(),

      // this.usersRepository.deleteAll(),
      // this.postsRepository.deleteAll(),
      // this.blogsRepository.deleteAll(),
      // this.commentsRepository.deleteAll(),
      // this.likesPostRepository.deleteAll(),
      // this.securityDevicesRepository.deleteAll(),
    ]);
  }
}
