import { Module } from '@nestjs/common';

import { BlogsModule } from '../blogs/blogs.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { CommentsModule } from '../comments/comments.module';
import { LikesPostModule } from '../likes-post/likes-post.module';
import { SecurityDevicesModule } from '../security-devices/security-devices.module';
import { LikesCommentModule } from '../likes-comment/likes-comment.module';
import { QuizQuestionsModule } from '../quiz-game/quiz-questions/quiz-questions.module';
import { PairsQuizModule } from '../quiz-game/pairs-quiz/pairs-quiz.module';
import { PairsQuizQuestionModule } from '../quiz-game/pairs-quiz-question/pairs-quiz-question.module';
import { PairsQuizAnswerModule } from '../quiz-game/pairs-quiz-answer/pairs-quiz-answer.module';

import { TestingController } from './testing.controller';

@Module({
  imports: [
    BlogsModule,
    PostsModule,
    UsersModule,
    CommentsModule,
    LikesPostModule,
    SecurityDevicesModule,
    LikesCommentModule,
    QuizQuestionsModule,
    PairsQuizModule,
    PairsQuizQuestionModule,
    PairsQuizAnswerModule,
  ],
  controllers: [TestingController],
})
export class TestingModule {}
