import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';
import { LikesCommentModule } from '../likes-comment/likes-comment.module';

import { CommentsQueryRepository } from './infrastructure/comments.query-repository';
import { CommentsController } from './comments.controller';
import { Comment, CommentSchema } from './infrastructure/comments.model';
import { CommentsRepository } from './infrastructure/comments.repository';
import { CreateCommentUseCase } from './application/use-cases/create-comment.useCase';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.useCase';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.useCase';
import { CommentsPgQueryRepository } from './infrastructure/comments.pg-query-repository';
import { CommentsPgRepository } from './infrastructure/comments.pg-repository';

const useCases = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    UsersModule,
    LikesCommentModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsQueryRepository,
    CommentsRepository,
    CommentsPgQueryRepository,
    CommentsPgRepository,
    ...useCases,
  ],
  exports: [
    CommentsQueryRepository,
    CommentsRepository,
    CommentsPgQueryRepository,
    CommentsPgRepository,
    CreateCommentUseCase,
  ],
})
export class CommentsModule {}
