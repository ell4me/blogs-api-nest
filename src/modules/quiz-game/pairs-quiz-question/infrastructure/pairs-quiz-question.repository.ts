import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { QuizQuestion } from '../../quiz-questions/infrastructure/quiz-question.entity';

import { PairQuizQuestion } from './pair-quiz-question.entity';

@Injectable()
export class PairsQuizQuestionRepository {
  constructor(
    @InjectRepository(PairQuizQuestion)
    private readonly pairQuizQuestionRepository: Repository<PairQuizQuestion>,
  ) {}

  create(questions: QuizQuestion[], pairId: string): PairQuizQuestion[] {
    return questions.map(({ id }) =>
      PairQuizQuestion.create({ questionId: id, pairId }),
    );
  }

  deleteAll(): Promise<DeleteResult> {
    return this.pairQuizQuestionRepository.delete({});
  }
}
