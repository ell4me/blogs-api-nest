import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CommentsQueryRepository } from './infrastructure/comments.query-repository';
import { CommentsController } from './comments.controller';
import { Comment, CommentSchema } from './infrastructure/comments.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
  controllers: [CommentsController],
  providers: [CommentsQueryRepository],
  exports: [CommentsQueryRepository],
})
export class CommentsModule {}
