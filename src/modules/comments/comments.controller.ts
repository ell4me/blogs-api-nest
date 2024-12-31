import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { ROUTERS_PATH } from '../../constants';

import { CommentsQueryRepository } from './comments.query-repository';

@Controller(ROUTERS_PATH.COMMENTS)
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  async getCommentById(@Param('id') id: string) {
    const comment = await this.commentsQueryRepository.getCommentById(id);

    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }
}
