import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuizQuestion } from './infrastructure/quiz-question.entity';
import { QuizQuestionsController } from './quiz-questions.controller';
import { QuizQuestionsQueryRepository } from './infrastructure/quiz-questions.query-repository';
import { QuizQuestionsRepository } from './infrastructure/quiz-questions.repository';
import { CreateQuizQuestionUseCase } from './applications/use-cases/create-quiz-question.useCase';
import { DeleteQuizQuestionUseCase } from './applications/use-cases/delete-quiz-question.useCase';
import { PublishedQuizQuestionUseCase } from './applications/use-cases/published-quiz-question-use.case';
import { UpdateQuizQuestionUseCase } from './applications/use-cases/update-quiz-question.useCase';

const useCases = [
  CreateQuizQuestionUseCase,
  DeleteQuizQuestionUseCase,
  PublishedQuizQuestionUseCase,
  UpdateQuizQuestionUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([QuizQuestion])],
  controllers: [QuizQuestionsController],
  providers: [
    QuizQuestionsRepository,
    QuizQuestionsQueryRepository,
    ...useCases,
  ],
  exports: [QuizQuestionsRepository],
})
export class QuizQuestionsModule {}
