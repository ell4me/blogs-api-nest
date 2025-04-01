import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';
import { LikesCommentModule } from '../likes-comment/likes-comment.module';

import { CommentsController } from './comments.controller';
import { Comment as CommentEntity } from './infrastructure/orm/comment.entity';
import { CreateCommentUseCase } from './application/use-cases/create-comment.useCase';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.useCase';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.useCase';
import { CommentsPgQueryRepository } from './infrastructure/pg/comments.pg-query-repository';
import { CommentsPgRepository } from './infrastructure/pg/comments.pg-repository';
import { CommentsOrmRepository } from './infrastructure/orm/comments.orm-repository';
import { CommentsOrmQueryRepository } from './infrastructure/orm/comments.orm-query-repository';

const useCases = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),
    // MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    UsersModule,
    LikesCommentModule,
  ],
  controllers: [CommentsController],
  providers: [
    // CommentsQueryRepository,
    // CommentsRepository,
    CommentsPgQueryRepository,
    CommentsPgRepository,
    CommentsOrmRepository,
    CommentsOrmQueryRepository,
    ...useCases,
  ],
  exports: [
    // CommentsQueryRepository,
    // CommentsRepository,
    CommentsPgQueryRepository,
    CommentsPgRepository,
    CommentsOrmRepository,
    CommentsOrmQueryRepository,
    CreateCommentUseCase,
  ],
})
export class CommentsModule {}
