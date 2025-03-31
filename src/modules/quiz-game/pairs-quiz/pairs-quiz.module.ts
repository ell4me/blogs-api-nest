import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuizQuestionsModule } from '../quiz-questions/quiz-questions.module';
import { PairsQuizQuestionModule } from '../pairs-quiz-question/pairs-quiz-question.module';
import { PairsQuizAnswerModule } from '../pairs-quiz-answer/pairs-quiz-answer.module';
import { PairQuizAnswer } from '../pairs-quiz-answer/infrastructure/pair-quiz-answer.entity';

import { PairsQuizController } from './pairs-quiz.controller';
import { PairQuiz } from './infrastructure/pair-quiz.entity';
import { PairsQuizQueryRepository } from './infrastructure/pairs-quiz.query-repository';
import { PairsQuizRepository } from './infrastructure/pairs-quiz.repository';
import { ConnectionPairUseCase } from './application/use-cases/connection-pair.useCase';
import { AnswerToQuestionUseCase } from './application/use-cases/answer-to-question.useCase';

const useCases = [ConnectionPairUseCase, AnswerToQuestionUseCase];

@Module({
  imports: [
    QuizQuestionsModule,
    PairsQuizQuestionModule,
    PairsQuizAnswerModule,
    TypeOrmModule.forFeature([PairQuiz, PairQuizAnswer]),
  ],
  controllers: [PairsQuizController],
  providers: [PairsQuizQueryRepository, PairsQuizRepository, ...useCases],
  exports: [PairsQuizRepository],
})
export class PairsQuizModule {}
