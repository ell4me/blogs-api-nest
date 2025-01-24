import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';

import { CommentsQueryRepository } from './infrastructure/comments.query-repository';
import { CommentsController } from './comments.controller';
import { Comment, CommentSchema } from './infrastructure/comments.model';
import { CommentsRepository } from './infrastructure/comments.repository';
import { CreateCommentUseCase } from './application/use-cases/create-comment.useCase';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.useCase';
import { LikeCommentUseCase } from './application/use-cases/like-comment.useCase';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.useCase';

const useCases = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  LikeCommentUseCase,
  DeleteCommentUseCase,
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsQueryRepository, CommentsRepository, ...useCases],
  exports: [CommentsQueryRepository, CommentsRepository, CreateCommentUseCase],
})
export class CommentsModule {}
