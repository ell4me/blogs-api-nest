import { Controller, Delete } from '@nestjs/common';

import { ROUTERS_PATH } from '../../constants';
import { UsersRepository } from '../users/users.repository';
import { PostsRepository } from '../posts/posts.repository';
import { BlogsRepository } from '../blogs/blogs.repository';

@Controller(ROUTERS_PATH.TESTING)
export class TestingController {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  @Delete('all-data')
  async deleteAllData() {
    await this.usersRepository.deleteAll();
    await this.postsRepository.deleteAll();
    await this.blogsRepository.deleteAll();
  }
}
